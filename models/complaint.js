const mongoose = require("mongoose");

const complaintSchema = mongoose.Schema(
  {
    title: {
      type: String,
      min: [5, "MINIMUM 10 CHARACTERS ARE REQUIRED!"],
      max: [10, "TITLE CAN'T EXCEED 10 CHARACTERS!"],
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    complainee_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complainee",
    },
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    workUpdate: {
      type: String,
    },
    media: {
      data: Buffer,
      contentType: String,
    },
    dateCreated: {
      type: Date,
    },
    dateUpdated: {
      type: Date,
    },
    dateResolved: {
      type: Date,
    },
    status: { type: String },
    assignedTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ServiceProvider",
      },
    ],
    rating: {
      type: Number,
    },
  },
  { versionKey: false }
);

module.exports = mongoose.model("Complaint", complaintSchema);
