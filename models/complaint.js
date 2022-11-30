const mongoose = require("mongoose");

const complaintSchema = mongoose.Schema(
  {
    title: {
      type: String,
      min: [5, "MINIMUM 10 CHARACTERS ARE REQUIRED!"],
      max: [10, "TITLE CAN'T EXCEED 10 CHARACTERS!"],
    },
    complainee_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complainee",
    },
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    description: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
    },
    workUpdate: [
      {
        type: String,
      },
    ],
    media: {
      type: String,
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
    status: {
      type: String,
      enum: ["RESOLVED", "ASSIGNED", "UNASSIGNED", "STOPPED", "ARCHIVED"],
    },
    assignHistory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceProvider",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceProvider",
    },
    rating: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rating",
    },
  },
  { versionKey: false }
);

module.exports = mongoose.model("Complaint", complaintSchema);
