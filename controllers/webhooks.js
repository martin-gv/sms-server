const db = require("../config/database");
const mailgun = require("../config/mailgun");

const Conversation = db.models.Conversation;
const Message = db.models.Message;
const User = db.models.User;

//
// ─── PROCESS INBOUND MESSAGE - WEBHOOK ──────────────────────────────────────────
//

// This controller function requires a socket.io instance
exports.inboundMessage = (io) => async (req, res) => {
  // Get the values of the inbound SMS from the Twilio POST request
  const fromNumber = req.body.From;
  const toNumber = req.body.To;
  const messageContent = req.body.Body;

  // Find the account associated with the 'to' number
  const user = await User.findOne({ where: { smsNumber: toNumber } });

  // Find the user's conversation that matches the 'from' number
  const matchingConversation = await Conversation.findOne({
    where: { userId: user.id, contactPhoneNumber: fromNumber },
  });

  // This variable will save the id of either the matching conversation,
  // or the newly created conversation if no matching one exists.
  let conversationId;

  // Save the id of the matching conversation
  if (matchingConversation !== null) {
    conversationId = matchingConversation.id;
  } else {
    // Or create a new one if no matching one exists
    const newConversation = await Conversation.create({
      userId: user.id,
      contactPhoneNumber: fromNumber,
    });

    conversationId = newConversation.id;
  }

  // Save the inbound message to the database
  const message = await Message.create({
    conversationId: conversationId,
    isInboundMessage: true,
    messageContent: messageContent,
  });

  // Emit the message via socket.io. If the user is currently connected they will see the reply
  emitReplyToClient({ io: io, message: message });

  // Send the recipient an email notification if they've set one up in their settings
  const emailRecipients = user.emailNotificationRecipients;

  if (emailRecipients !== null && emailRecipients !== "") {
    const email = {
      to: emailRecipients,
      from: "SMS Notifier <sms-notifier@mail.sms.martin-gv.com>",
      subject: `SMS from ${fromNumber}`,
      html: `
      <h3>New SMS Message</h3>
      <strong>From:</strong> ${fromNumber}<br/>
      <strong>Message:</strong> ${messageContent}<br/>
      <br/>
      <a href="${process.env.APP_DOMAIN_URL}/conversations/${conversationId}">
      Click here to open conversation
      </a>
      `,
    };

    mailgun.messages().send(email, (error, body) => {
      if (error) {
        console.log(error);
      } else {
        console.log("email sent!");
        console.log(body);
      }
    });
  }

  res.status(204).end();
};

//
// ─── EMIT REAL-TIME REPLY TO THE CLIENT VIA SOCKET.IO ───────────────────────────
//

function emitReplyToClient({ io, message }) {
  io.to(message.conversationId).emit("inbound message", { message: message });
}

//
// ─── DELIVERY RECEIPTS - WEBHOOK ────────────────────────────────────────────────
//

exports.deliveryReceipts = (req, res) => {
  res.status(204).end();
};
