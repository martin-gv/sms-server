const db = require("../config/database");
const PNF = require("google-libphonenumber").PhoneNumberFormat;
const phoneUtil = require("google-libphonenumber").PhoneNumberUtil.getInstance();

const Conversation = db.models.Conversation;
const Message = db.models.Message;

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
// ─── RENDER SINGLE CONVERSATION PAGE ────────────────────────────────────────────
//

exports.getSingleConversation = async (req, res) => {
  // Get the requested conversation and all associated messages
  const conversationId = req.params.conversationId;
  const currentConversation = await Conversation.findOne({
    where: { id: conversationId },
    include: Message,
  });

  const message = req.flash();
  res.render("conversation/conversation", {
    message: message,
    conversation: currentConversation,
    css: ["conversation"],
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
