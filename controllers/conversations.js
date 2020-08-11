const db = require("../config/database");
const PNF = require("google-libphonenumber").PhoneNumberFormat;
const phoneUtil = require("google-libphonenumber").PhoneNumberUtil.getInstance();
const moment = require("moment");

const Conversation = db.models.Conversation;
const Message = db.models.Message;

//
// ─── NUMBER REQUIRED - MIDDLEWARE ───────────────────────────────────────────────
//

exports.numberRequired = (req, res, next) => {
  if (req.user.smsNumber !== null) {
    next();
  } else {
    req.flash("warning", "Get a number to start sending messages");
    res.redirect("/new-number");
  }
};

//
// ─── RENDER CONVERSATIONS LIST PAGE ─────────────────────────────────────────────
//

exports.getConversation = async (req, res) => {
  // Find all conversations for the current user. The
  // current user instance is saved in req by Passport.
  const currentUser = req.user;
  const conversations = await currentUser.getConversations();

  const message = req.flash();
  res.render("conversations-list", {
    message: message,
    conversations: conversations,
  });
};

//
// ─── FIND CONVERSATION - MIDDLEWARE ─────────────────────────────────────────────
//

exports.findConversation = async (req, res, next) => {
  try {
    const conversationId = req.params.conversationId;

    // Find the conversation by id
    const conversation = await Conversation.findOne({
      where: { id: conversationId },
      include: {
        model: Message,
        limit: 25,
        order: [["createdAt", "DESC"]],
      },
    });

    // Show error if conversation does not exist
    if (conversation === null) {
      req.flash("error", "No conversation found");
      res.redirect("/conversations");
    }

    // Save conversation for later use
    res.locals.conversation = conversation;

    next();
  } catch (error) {
    next(error);
  }
};

//
// ─── CHECK OWNER OF CONVERSATION - MIDDLEWARE ───────────────────────────────────
//

exports.checkOwner = async (req, res, next) => {
  try {
    const conversation = res.locals.conversation;
    const currentUser = req.user;

    // If the current user is the owner of the conversation being
    // retrieved, then continue to the next controller function
    if (conversation.userId === currentUser.id) {
      // Save the conversation for later use
      res.locals.conversation = conversation;

      next();
      return;
    }

    // Else show an error
    req.flash("error", "You do not have permission to view that conversation");
    res.redirect("/conversations");
  } catch (error) {
    next(error);
  }
};

//
// ─── RENDER SINGLE CONVERSATION PAGE ────────────────────────────────────────────
//

exports.getSingleConversation = async (req, res) => {
  // Get the previously retrieved conversation
  const conversation = res.locals.conversation;

  // Messages are queried from newest to oldest (ORDER BY "Message"."createdAt" DESC)
  // to get the most recent ones, but on the front end they should be displayed with
  // the oldest ones at the top, and the newest at the bottom.
  conversation.Messages.reverse();

  // Format dates for front end
  conversation.Messages = conversation.Messages.map((el) => {
    // Convert Message instances to raw data objects for manipulation. If a property
    // is added to the "object" returned from Sequelize, the property is added to
    // the instance, not to the data itself.
    return el.get({ plain: true });
  }).map((el) => {
    // Add formatted date
    return {
      ...el,
      createdAtFormatted: moment(el.createdAt).format("ddd, MMM  Do • h:mm A"),
    };
  });

  const message = req.flash();
  res.render("conversation/conversation", {
    message: message,
    conversation: conversation,
    css: ["conversation"],
    js: ["conversation"],
  });
};

//
// ─── VALIDATE PHONE NUMBER - MIDDLEWARE ─────────────────────────────────────────
//

exports.validateNumber = (req, res, next) => {
  const toNumber = req.body.phoneNumber;

  // Check for international format
  if (toNumber.charAt(0) === "+") {
    req.flash("error", "International texting is currently not supported");
    res.redirect("/conversations");
    return;
  }

  const parsedNumber = phoneUtil.parseAndKeepRawInput(toNumber, "CA");

  // phoneUtil.isValidNumber expects a parsed number
  const isValidNumber = phoneUtil.isValidNumber(parsedNumber);

  // Check if number is valid for the region (Canada)
  if (isValidNumber === false) {
    req.flash(
      "error",
      `<strong>${toNumber}</strong> is not a valid Canadian phone number`
    );
    res.redirect("/conversations");
    return;
  }

  // Leading + removed for two reasons:
  // * Nexmo documentation examples don't have it
  // * Nexmo documentation says that numbers in E.164 format 'omit ... a leading +'
  //
  // As far as I can tell, the leading + is required in E.164 format, but since
  // Nexmo specifically states otherwise I've decided to follow their examples
  // when using their service and npm package.
  //
  // Also, phoneUtil.format expects a parsed number.
  const formattedNumber = phoneUtil.format(parsedNumber, PNF.E164).substring(1);

  // Save number for later use in controller chain
  res.locals.formattedNumber = formattedNumber;

  next();
};

//
// ─── CREATE NEW CONVERSATION - FORM SUBMISSION ──────────────────────────────────
//

exports.addConversation = async (req, res, next) => {
  try {
    // Prepare values for new record
    const userId = req.user.id;
    const contactPhoneNumber = res.locals.formattedNumber;

    // Find conversation if it already exists
    const conversation = await Conversation.findOne({
      where: { userId: userId, contactPhoneNumber: contactPhoneNumber },
    });

    if (conversation !== null) {
      // If conversation exists show an error
      req.flash(
        "error",
        `A conversation for <strong>${contactPhoneNumber}</strong> already exists`
      );
    } else {
      // Otherwise, create a new record
      await Conversation.create({
        userId: userId,
        contactPhoneNumber: contactPhoneNumber,
      });
    }

    res.redirect("/conversations");
  } catch (error) {
    next(error);
  }
};
