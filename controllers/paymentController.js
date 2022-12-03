// IMPORTED REQUIRED PACKAGE(S)
const { Stripe } = require("../utils/packages");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
// MODELS
const Payment = require("../models/payment");

// STRIPE: PAYEMENT INTENT
exports.addPaymentIntent = async (req, res) => {
  try {
    const { id } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 100,
      currency: "usd",
      payment_method: id,
    });
    console.log(paymentIntent);
    res.json(paymentIntent);
  } catch (err) {
    console.error("ERROR:" + err.message);
  }
};

// STRIPE: ADD PAYMENT
exports.addPayment = (req, res) => {
  try {
    const companyId = req.params.id;
    const amount = req.body.amount;
    const subscriptionId = req.body.subscriptionId;
    stripe.charges
      .create({
        amount: 100,
        source: req.body.stripeTokenId,
        currency: "usd",
      })
      .then((res) => {
        console.log(res);
        Payment.create(
          {
            coompanyId: companyId,
            subscriptionId: subscriptionId,
            amount: amount,
            date: new Date(),
          },
          (err, payment) => {
            if (err) {
              res.send({
                status: 500,
                success: false,
                message: err.message,
              });
            } else {
              res.send({
                status: 200,
                success: true,
                message: "PAYEMENT IS SUCCESSFULLY MADE!",
              });
            }
          }
        );
      })
      .catch((err) => {
        console.error("ERROR: " + err.message);
        res.send({
          status: 500,
          success: false,
          message: err.message,
        });
      });
  } catch (err) {
    console.error("ERROR:" + err.message);
    res.send({
      status: 500,
      success: false,
      message: err.message,
    });
  }
};
