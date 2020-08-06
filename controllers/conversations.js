const db = require("../config/database");

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
// ─── CREATE NEW CONVERSATION - FORM SUBMISSION ──────────────────────────────────
//

exports.addConversation = async (req, res, next) => {
  try {
    // Prepare values for new record
    const userId = req.user.id;
    const contactPhoneNumber = req.body.phoneNumber;

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
