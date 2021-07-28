const stripe = require("../config/stripe");

const DOMAIN = process.env.DOMAIN;

//
// ─── CREATE STRIPE CHECKOUT SESSION ─────────────────────────────────────────────
//

exports.createCheckoutSession = async (req, res, next) => {
  try {
    const { priceId } = req.body;

    // See https://stripe.com/docs/api/checkout/sessions/create
    // for additional parameters to pass.
    const config = {
      mode: "subscription",
      payment_method_types: ["card"],

      // For metered billing, do not pass quantity
      line_items: [{ price: priceId, quantity: 1 }],

      // Pass in the client's id for later use in the Stripe events webhook to provision the client's subscription
      client_reference_id: req.user.id,

      cancel_url: DOMAIN + "/settings",
    };

    // FYI, {CHECKOUT_SESSION_ID} is a string literal; do not change it! The actual session ID
    // is returned in the query parameter when the customer is redirected to the success page.
    const SESSION_ID = "?session_id={CHECKOUT_SESSION_ID}";

    // Stripe accepts only one of either 'customer' or 'customer_email'.
    if (!req.user.stripeCustomerId) {
      // For new customers
      config.customer_email = req.user.email;
      config.success_url = DOMAIN + "/billing/checkout-complete" + SESSION_ID;
    } else {
      // For subscription reactivations
      config.customer = req.user.stripeCustomerId;
      config.success_url =
        DOMAIN + "/billing/reactivation-complete" + SESSION_ID;
    }

    const session = await stripe.checkout.sessions.create(config);

    res.status(200).json({ sessionId: session.id });
  } catch (err) {
    next(err);
  }
};

//
// ─── CHECKOUT SESSION SUCCESS URL ───────────────────────────────────────────────
//

exports.checkoutComplete = async (req, res, next) => {
  try {
    /**
     * From the Stripe docs:
     * Your webhook endpoint redirects your customer to the success_url when you acknowledge you received
     * the event. In scenarios where your endpoint is down or the event isn’t acknowledged properly, your
     * handler redirects the customer to the success_url 10 seconds after a successful payment.
     */

    // Users hit this endpoint only from an INCOMPLETE status. So the two possible options are that the
    // checkout.session.completed webhook failed to update, so the user remains in the INACTIVE status, or
    // that it was successful and so the user will be in the ACTIVE status

    const status = req.user.subscriptionStatus;

    if (status === "INCOMPLETE") {
      res.render("payment-pending");
      return;
    }

    if (status === "ACTIVE") {
      req.flash(
        "success",
        "Your subscription is now active! Get a new number below"
      );
      req.session.save(() => res.redirect("/new-number"));
      return;
    }

    // Subscription is not ACTIVE or INCOMPLETE
    res.redirect("/settings");
  } catch (err) {
    next(err);
  }
};

//
// ─── CHECKOUT SESSION SUCCESS URL - SUBSCRIPTION REACTIVATION ───────────────────
//

exports.reactivationComplete = async (req, res, next) => {
  try {
    // Users hit this endpoint only from the CANCELED status, and only after a checkout session
    // has been successful (their subscription has been reactivated) via the success_url parameter.

    // However, the webhook 'checkout.session.completed' may not trigger and so two possible outcomes must be handled:
    // - Success (the webhook responded within 10 seconds) -> the user's status is ACTIVE
    // - Failure (no response, or dropped webhook event) -> the user's status  remains CANCELED

    const status = req.user.subscriptionStatus;

    if (status === "CANCELED") {
      res.render("payment-pending");
      return;
    }

    if (status === "ACTIVE") {
      req.flash("success", "Your subscription is now active!");
      req.session.save(() => res.redirect("/settings"));
      return;
    }

    // Subscription is not ACTIVE or CANCELED
    res.redirect("/settings");
  } catch (err) {
    next(err);
  }
};

//
// ─── CREATE STRIPE BILLING PORTAL SESSION ───────────────────────────────────────
//

exports.createPortalSession = async (req, res, next) => {
  try {
    // Currently logged in user
    const user = req.user;

    // This is the url to which the customer will be redirected when they are done managing their billing with the portal.
    const returnUrl = process.env.DOMAIN + "/settings";

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: returnUrl,
    });

    res.redirect(session.url);
  } catch (err) {
    next(err);
  }
};
