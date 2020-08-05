const db = require("../config/database");

const Conversation = db.models.Conversation;

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
  // Get the requested conversation
  const conversationId = req.params.conversationId;
  const conversation = await Conversation.findOne({
    where: { id: conversationId },
  });

  res.render("conversation", { conversation: conversation });
};

//
// ─── CREATE NEW CONVERSATION - FORM SUBMISSION ──────────────────────────────────
//

exports.addConversation = async (req, res) => {
  // Prepare values for new record
  const userId = req.user.id;
  const contactPhoneNumber = req.body.phoneNumber;

  // Create new record
  await Conversation.create({
    userId: userId,
    contactPhoneNumber: contactPhoneNumber,
  });

  res.redirect("/conversations");
};
