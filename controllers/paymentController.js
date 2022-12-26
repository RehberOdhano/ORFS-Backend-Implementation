// IMPORTED REQUIRED PACKAGE(S)
const { Stripe } = require("../utils/packages");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
// MODELS
const Payment = require("../models/payment");

// this will initiate the payment cycle...
exports.initiatePayment = (req, res) => {
    try {
        const companyId = req.params.id;
        const { subscriptionId, duration } = req.body;
        const amount = duration === 3 ? 300 : duration === 6 ? 500 : duration === 12 ? 1000 : 0;
        const paymentObj = {
            companyId: companyId,
            subscriptionId: subscriptionId,
            amount: amount * 100,
            date: Date.now(),
            success: false
        }
        console.log("paymentObj: " + paymentObj)
        Payment.create(paymentObj, (err, payment) => {
            if (err) {
                res.status(500).send({ message: err.message });
            } else {
                console.log('payment: ' + payment)
                res.status(200).send(payment);
            }
        })
    } catch (err) {
        console.error("ERROR:" + err.message);
    }
}

// STRIPE: PAYEMENT INTENT
exports.addPaymentIntent = async(req, res) => {
    try {
        const { id } = req.body;
        const paymentIntent = await stripe.paymentIntents.create({
            amount: 100,
            currency: "usd",
            payment_method: id,
        });
        delete paymentIntent.livemode;
        delete paymentIntent.id;
        delete paymentIntent.object;
        delete paymentIntent.created;
        console.log(paymentIntent);
        res.json(paymentIntent);
    } catch (err) {
        console.error("ERROR:" + err.message);
    }
};

// change the payment status when the payment cycle is completed successfully...
exports.confirmPayment = (req, res) => {
    try {
        const paymentId = req.params.id;
        Payment.updateOne({ _id: paymentId }).exec((err, payment) => {
            if (err) {
                res.status(500).send({ message: err.message });
            } else {
                res.status(200).send("PAYMENT IS SUCCESSFULLY COMPLETED!");
            }
        })
    } catch (err) {
        console.error("ERROR:" + err.message);
    }
}