const mongoose = require("mongoose");

const paymentSchema = mongoose.Schema({}, { versionKey: false });

module.exports = mongoose.model("Payment", paymentSchema);
