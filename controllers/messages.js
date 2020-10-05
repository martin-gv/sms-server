const db = require("../config/database");
const twilio = require("../config/twilio");

const Conversation = db.models.Conversation;
const Message = db.models.Message;

//
// ─── SEND NEW MESSAGE - FORM SUBMISSION ─────────────────────────────────────────
//

exports.sendMessage = async (req, res, next) => {
  try {
    // Get phone number of current user
    const fromNumber = req.user.smsNumber;

    // Get values from form submission
    const { conversationId, messageContent } = req.body;

    // Find conversation record in the database
    const conversation = await Conversation.findOne({
      where: { id: conversationId },
    });

    // Check if the current user is the owner of the conversation
    if (conversation.userId !== req.user.id) {
      req.flash("error", "Conversation permission error");
      res.redirect("/conversations");
    }

    // Send text message using Twilio
    twilio.messages
      .create({
        body: messageContent,
        from: "1237562",
        to: conversation.contactPhoneNumber,
      })
      .then((message) => {
        // Save info in locals
        res.locals.conversation = conversation;
        res.locals.messageContent = messageContent;

        // Save to database in the next middleware
        next();
      })
      .catch((error) => {
        next(error);
      });
  } catch (error) {
    next(error);
  }
};

//
// ─── SAVE OUTBOUND MESSAGE TO THE DATABASE ──────────────────────────────────────
//

// This function runs after calling next() in exports.sendMessage
exports.saveMessage = async (req, res) => {
  try {
    const { conversation, messageContent } = res.locals;

    // Create new record
    await Message.create({
      conversationId: conversation.id,
      isInboundMessage: false,
      messageContent: messageContent,
    });

    res.redirect("/conversations/" + conversation.id);
  } catch (error) {
    req.flash("error", error.message);
    res.redirect("/conversations");
  }
};
