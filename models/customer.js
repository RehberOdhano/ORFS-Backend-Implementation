const mongoose = require("mongoose");

const customerSchema = mongoose.Schema(
  {
    website: {
      type: String,
      unique: true,
      required: [true, "WEBSITE IS REQUIRED!"],
    },
    title: {
      type: String,
      required: [true, "TITLE IS REQUIRED!"],
    },
    status: {
      type: String,
      required: [true, "STATUS IS REQUIRED!"],
      enum: ["ACTIVE", "ONBOARDING", "RENEWAL", "INACTIVE"],
    },
    customerTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CustomerType",
    },
    pfp: {
      type: String,
    },
    dateRegistered: {
      type: Date,
    },
    subscription_plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
    },
    employees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    addons: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Addon",
      },
    ],
    departments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
      },
    ],
    billing_info: {
      type: Object,
      payment_method: { type: String },
    },
  },
  { versionKey: false }
);

module.exports = mongoose.model("Customer", customerSchema);
