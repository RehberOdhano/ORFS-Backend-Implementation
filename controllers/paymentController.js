// IMPORTED REQUIRED PACKAGE(S)
const { stripe } = require("../utils/packages");

// MODELS
const Payment = require("../models/payment");

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
        Payment.create({}, (err, payment) => {
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
        });
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
