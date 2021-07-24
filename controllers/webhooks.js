const db = require("../config/database");
const MessagingResponse = require("twilio").twiml.MessagingResponse;
const mailgun = require("../config/mailgun");
const stripe = require("../config/stripe");

const Conversation = db.models.Conversation;
const Message = db.models.Message;
const User = db.models.User;

//
// ─── PROCESS INBOUND MESSAGE - WEBHOOK ──────────────────────────────────────────
//

// This controller function requires a socket.io instance
exports.inboundMessage = (io) => async (req, res, next) => {
  try {
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

    // Save the inbound message to the database and update the unread messages count
    const message = await db.transaction(async (t) => {
      const message = await Message.create(
        {
          conversationId: conversationId,
          isInboundMessage: true,
          messageContent: messageContent,
        },
        { transaction: t }
      );

      await Conversation.increment("unreadMessages", {
        where: { id: conversationId },
        transaction: t,
      });

      return message;
    });

    // Emit the message via socket.io. If the user is currently connected they will see the reply
    emitSocketIoEvent({ io: io, message: message });

    // Send the recipient an email notification if they've set one up in their settings
    const emailRecipients = user.emailNotificationRecipients;
    if (emailRecipients !== null && emailRecipients !== "") {
      sendEmailNotification(emailRecipients, fromNumber, message);
    }

    // Respond to the Twilio webhook request. The code below follows the example in the Twilio docs
    const twiml = new MessagingResponse();
    res.writeHead(200, { "Content-Type": "text/xml" });
    res.end(twiml.toString());
  } catch (error) {
    next(error);
  }
};

//
// ─── EMIT REAL-TIME REPLY TO THE CLIENT VIA SOCKET.IO ───────────────────────────
//

function emitSocketIoEvent({ io, message }) {
  io.to(message.conversationId).emit("inbound message", { message: message });
}

//
// ─── SEND EMAIL NOTIFICATION ────────────────────────────────────────────────────
//

function sendEmailNotification(emailRecipients, fromNumber, message) {
  const email = {
    to: emailRecipients,
    from: "SMS Notifier <sms-notifier@mail.sms.martin-gv.com>",
    subject: `SMS from ${fromNumber}`,
    html: `
    <h3>New SMS Message</h3>
    <strong>From:</strong> ${fromNumber}<br/>
    <strong>Message:</strong> ${message.messageContent}<br/>
    <br/>
    <a href="${process.env.DOMAIN}/conversations/${message.conversationId}">
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

//
// ─── DELIVERY RECEIPTS - WEBHOOK ────────────────────────────────────────────────
//

exports.deliveryReceipts = (req, res) => {
  res.status(204).end();
};

//
// ─── STRIPE EVENTS - WEBHOOK ────────────────────────────────────────────────────
//

exports.stripeEvents = async (req, res, next) => {
  try {
    //
    // ─── RETRIEVE THE EVENT ──────────────────────────────────────────
    //

    let event;

    const rawBody = req.rawBody;
    const signature = req.headers["stripe-signature"];
    const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

    // Construct the event by verifying the signature using the raw body and secret

    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.log(`⚠️ Webhook signature verification failed.`);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    // Extract the object from the event.
    const stripeObject = event.data.object;
    const eventType = event.type;

    //
    // ─── HANDLE EVENT TYPES ──────────────────────────────────────────
    //

    switch (eventType) {
      /**
       * Initial payment is successful and the subscription is now created in Stripe. We can now add the
       * Stripe customer ID to the user's record. This event also triggers for subscription reactivations.
       */
      case "checkout.session.completed": {
        const checkoutSession = stripeObject;

        await User.update(
          {
            stripeCustomerId: checkoutSession.customer,
            subscriptionStatus: "ACTIVE",
            hasPaymentError: false,
          },
          { where: { id: checkoutSession.client_reference_id } } // find by the Stripe session's client_reference_id
        );

        break;
      }

      // ─────────────────────────────────────────────────────────────────

      /**
       * Reset a user's status and payment error when a Stripe payment goes through.
       * This resets the statuses set by the webhooks:
       * - invoice.payment_failed
       * - customer.subscription.updated (past due)
       */
      case "invoice.paid": {
        const invoice = stripeObject;

        await User.update(
          { subscriptionStatus: "ACTIVE", hasPaymentError: false },
          { where: { stripeCustomerId: invoice.customer } } // find the user by the Stripe customer id
        );

        break;
      }

      // ─────────────────────────────────────────────────────────────────

      /**
       * Update the user's payment error status if a Stripe payment fails
       */
      case "invoice.payment_failed": {
        const invoice = stripeObject;

        // Don't update when creating new subscriptions (whether for new or old customers). i.e. No errors
        // need to be saved when a subscription isn't successfully created in a checkout session. Otherwise,
        // this should run for failed subscription cycle payments and other failed payments.
        if (invoice.billing_reason !== "subscription_create") {
          await User.update(
            { hasPaymentError: true },
            { where: { stripeCustomerId: invoice.customer } } // find the user by the Stripe customer id
          );
        }

        break;
      }

      // ─────────────────────────────────────────────────────────────────

      /**
       * Update the user's status after the Stripe subscription becomes past due
       */
      case "customer.subscription.updated": {
        const subscription = stripeObject;

        if (subscription.status === "past_due") {
          await User.update(
            { subscriptionStatus: "PAST DUE" },
            { where: { stripeCustomerId: subscription.customer } } // find user by the Stripe customer id
          );
        }

        break;
      }

      // ─────────────────────────────────────────────────────────────────

      /**
       * Update the user's status after the Stripe subscription is cancelled
       */
      case "customer.subscription.deleted": {
        const subscription = stripeObject;

        await User.update(
          { subscriptionStatus: "CANCELED", hasPaymentError: false },
          { where: { stripeCustomerId: subscription.customer } } // find user by the Stripe customer id
        );

        break;
      }

      // ─────────────────────────────────────────────────────────────────

      default:
      // Unhandled event types
    }

    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
};
