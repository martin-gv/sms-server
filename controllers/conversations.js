const db = require("../config/database");

const Conversation = db.models.Conversation;

//
// ─── GET REQUEST - RENDER CONVERSATIONS PAGE ────────────────────────────────────
//

exports.getConversation = async (req, res) => {
  // Find all conversations for the current user. The
  // current user instance is saved in req by Passport.
  const User = req.user;
  const conversations = await User.getConversations();

  res.render("conversations-list", { conversations: conversations });
};

//
// ─── GET REQUEST - RENDER SINGLE CONVERSATION PAGE ──────────────────────────────
//

exports.getSingleConversation = async (req, res) => {
  console.log("params", req.params);

  const conversationId = req.params.conversationId;
  const conversation = await Conversation.findOne({
    where: { id: conversationId },
  });
  console.log(conversation);

  res.render("conversation", { conversation: conversation });
};

//
// ─── POST REQUEST - HANDLE NEW CONVERSATION FORM SUBMISSION ─────────────────────
//

exports.addConversation = async (req, res) => {
  // Prepare new record
  const userId = req.user.id;
  const contactPhoneNumber = req.body.phoneNumber;

  // Create new record
  await Conversation.create({
    userId: userId,
    contactPhoneNumber: contactPhoneNumber,
  });

  res.redirect("/conversations");
};
