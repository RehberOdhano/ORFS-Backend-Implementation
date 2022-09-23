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
      ref: "customer",
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
        _id: {
          type: mongoose.Schema.Types.ObjectId,
        },
        email: {
          type: String,
        },
      },
    ],
    addons: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Addon",
        required: [true, "ADDONS ARE REQUIRED!"],
        default: [],
      },
    ],
    departments: [
      {
        _id: {
          type: mongoose.Schema.Types.ObjectId,
        },
        title: {
          type: String,
        },
      },
    ],
    // analytics: {},
    billing_info: {
      type: Object,
      // required: true,
      payment_method: { type: String },
    },
  },
  { versionKey: false }
);

module.exports = mongoose.model("Customer", customerSchema);
