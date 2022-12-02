const mongoose = require("mongoose");

const subscriptionSchema = mongoose.Schema(
  {
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },
    price: {
      type: Number,
    },
    duration: {
      type: Number,
    },
    datePurchased: {
      type: Date,
    },
    dateTillExpiry: {
      type: Date,
    },
  },
  { versionKey: false }
);

module.exports = mongoose.model("Subscription", subscriptionSchema);
