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
  // A database User instance of the current user is saved in req by Passport
  const currentUser = req.user;

  // Find all conversations for the current user
  const conversations = await Conversation.findAll({
    where: { userId: currentUser.id },
    include: {
      model: Message,
      limit: 1,
      order: [["createdAt", "DESC"]],
    },
  });

  const sortedConversations = conversations
    .map((el) => {
      // Convert to plain objects so new properties can be added to each record
      return el.get({ plain: true });
    })
    .map((el) => {
      let sortDate;

      // Set the new property sortDate to either the date of the most recent message
      // or, if the conversation has no messages, to the conversation's creation date
      if (el.Messages.length === 1) {
        sortDate = el.Messages[0].createdAt;
      } else {
        sortDate = el.createdAt;
      }

      const formattedSortDate = moment(sortDate).fromNow();

      return {
        ...el,
        sortDate: sortDate,
        formattedSortDate: formattedSortDate,
      };
    })
    .sort((a, b) => {
      // Sort by the new property sortDate from newest to oldest
      return b.sortDate - a.sortDate;
    });

  const message = req.flash();

  res.render("chats/chatList", {
    message: message,
    conversations: sortedConversations,
    css: ["conversations-list"],
  });
};

//
// ─── FIND CONVERSATION AND MESSAGES - MIDDLEWARE ────────────────────────────────
//

exports.findConversationAndMessages = async (req, res, next) => {
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

    // If conversation does not exist, shown an error
    if (conversation === null) {
      req.flash("error", "No conversation found");
      res.redirect("/conversations");
      return;
    }

    // Save conversation for later use
    res.locals.conversation = conversation;

    next();
  } catch (error) {
    next(error);
  }
};

//
// ─── FIND CONVERSATION ONLY - MIDDLEWARE ────────────────────────────────────────
//

exports.findConversation = async (req, res, next) => {
  try {
    const conversationId = req.params.conversationId;

    // Find the conversation by id
    const conversation = await Conversation.findOne({
      where: { id: conversationId },
    });

    // If conversation does not exist, shown an error
    if (conversation === null) {
      req.flash("error", "No conversation found");
      res.redirect("/conversations");
      return;
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

    // If the current user isn't the conversation's owner, show an error
    if (conversation.userId !== currentUser.id) {
      req.flash(
        "error",
        "You do not have permission to view that conversation"
      );
      res.redirect("/conversations");
      return;
    }

    next();
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

  // Add formatted phone number
  const parsedNumber = phoneUtil.parseAndKeepRawInput(
    conversation.contactPhoneNumber,
    "CA"
  );

  conversation.formattedPhoneNumber = phoneUtil.format(
    parsedNumber,
    PNF.NATIONAL
  );

  // Render page
  const message = req.flash();
  res.render("chats/chatDetails/chatDetails", {
    message: message,
    conversation: conversation,
    css: ["conversation"],
    js: ["smoothscroll.min", "moment.min", "conversation"],
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

  // Check if number is valid for the region (Canada)
  // phoneUtil.isValidNumber expects a parsed number
  const isValidNumber = phoneUtil.isValidNumber(parsedNumber);
  if (isValidNumber === false) {
    req.flash(
      "error",
      `<strong>${toNumber}</strong> is not a valid Canadian phone number`
    );
    res.redirect("/conversations");
    return;
  }

  // Save parsed number for later use in controller chain
  // phoneUtil.format expects a parsed number
  res.locals.parsedNumber = parsedNumber;

  next();
};

//
// ─── CREATE NEW CONVERSATION - FORM SUBMISSION ──────────────────────────────────
//

exports.addConversation = async (req, res, next) => {
  try {
    // Get parsed number from previous middleware
    const parsedNumber = res.locals.parsedNumber;

    // Convert number to E.164 format (used to find an existing conversation, and create a new one if required)
    const e164formattedNum = phoneUtil.format(parsedNumber, PNF.E164);

    // Find conversation if it already exists
    const conversation = await Conversation.findOne({
      where: { userId: req.user.id, contactPhoneNumber: e164formattedNum },
    });

    // If conversation exists show an error
    if (conversation !== null) {
      // Convert number to a readable format
      const formattedNum = phoneUtil.format(parsedNumber, PNF.NATIONAL);

      req.flash(
        "error",
        `A conversation for <strong>${formattedNum}</strong> already exists`
      );
    } else {
      // Otherwise, create a new record
      await Conversation.create({
        userId: req.user.id,
        contactPhoneNumber: e164formattedNum,
        contactFirstName: req.body.firstName,
        contactLastName: req.body.lastName,
      });
    }

    res.redirect("/conversations");
  } catch (error) {
    next(error);
  }
};

//
// ─── EDIT CONVERSATION - FORM SUBMISSION ────────────────────────────────────────
//

exports.editConversation = async (req, res) => {
  try {
    const conversationId = req.params.conversationId;

    const conversationData = {
      contactFirstName: req.body.firstName,
      contactLastName: req.body.lastName,
    };

    await Conversation.update(conversationData, {
      where: { id: conversationId },
    });

    res.redirect("/conversations/" + conversationId);
  } catch (error) {
    next(error);
  }
};
