const db = require("../config/database");
const mailgun = require("../config/mailgun");

const Conversation = db.models.Conversation;
const Message = db.models.Message;
const User = db.models.User;

//
// ─── PROCESS INBOUND MESSAGE - WEBHOOK ──────────────────────────────────────────
//

exports.inboundMessage = async (req, res) => {
  // Get the values of the inbound SMS
  const fromNumber = req.body.msisdn;
  const toNumber = req.body.to;
  const messageContent = req.body.text;

  // Find the account associated with the 'to' number
  const user = await User.findOne({ where: { smsNumber: toNumber } });

  // Find the user's conversation that matches the 'from' number
  const conversation = await Conversation.findOne({
    where: { userId: user.id, contactPhoneNumber: fromNumber },
  });

  // Save the inbound message to the database
  await Message.create({
    conversationId: conversation.id,
    isInboundMessage: true,
    messageContent: messageContent,
  });

  // Send the recipient user an email notification
  const emailRecipients = user.emailNotificationRecipients;

  const email = {
    to: emailRecipients,
    from: "SMS Notifier <sms-notifier@mail.sms.martin-gv.com>",
    subject: `SMS from ${fromNumber}`,
    html: `
      <h3>New SMS Message</h3>
      <strong>From:</strong> ${fromNumber}<br/>
      <strong>Message:</strong> ${messageContent}<br/>
      <br/>
      <a href="${process.env.APP_DOMAIN_URL}/conversations/${conversation.id}">
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

  res.status(204).end();
};
