const mongoose = require("mongoose");

const subscriptionSchema = mongoose.Schema(
  {
    title: {
      type: String,
    },
    price: {
      type: Number,
    },
  },
  { versionKey: false }
);

module.exports = mongoose.model("Subscription", subscriptionSchema);
