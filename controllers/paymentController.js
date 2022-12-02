const { stripe } = require("../utils/packages");

// STRIPE PAYMENT
exports.addPayment = (req, res) => {
  try {
    stripe.charges
      .create({
        amount: 100,
        source: req.body.stripeTokenId,
        currency: "usd",
      })
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.error("ERROR: " + err.message);
      });
  } catch (err) {
    console.error("ERROR:" + err.message);
  }
};
