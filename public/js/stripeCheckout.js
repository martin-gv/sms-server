const stripe = Stripe(stripePublicKey);

//
// ─── ADD A PAYMENT METHOD BUTTON ────────────────────────────────────────────────
//

function addPaymentMethod() {
  // Create checkout session for basic Plan $15/month
  // const priceId = "price_1I88pIHXr4rx7oIVJ5X4YKOU";

  // Test daily plan $5/day
  const priceId = "price_1IKoMrHXr4rx7oIVDL0joS8W";

  createCheckoutSession(priceId).then(function (sessionId) {
    // Call Stripe.js method to redirect to the checkout page
    stripe.redirectToCheckout({ sessionId: sessionId }).then(function (result) {
      if (result.error) {
        console.log(result.error.message);
      }
    });
  });
}

//
// ─── GET STRIPE CHECKOUT SESSION ────────────────────────────────────────────────
//

function createCheckoutSession(priceId) {
  return axios
    .post("/billing/checkout-session", { priceId: priceId })
    .then(function (response) {
      return response.data.sessionId;
    })
    .catch(function (error) {
      console.log(error);
    });
}
