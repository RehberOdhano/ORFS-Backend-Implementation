const mongoose = require("mongoose");

const paymentSchema = mongoose.Schema({
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
    },
    subscriptionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subscription",
    },
    amount: {
        type: Number,
    },
    date: {
        type: Date,
    },
    success: {
        type: Boolean,
    }
}, { versionKey: false });

module.exports = mongoose.model("Payment", paymentSchema);