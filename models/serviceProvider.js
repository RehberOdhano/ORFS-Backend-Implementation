const mongoose = require("mongoose");

const service_providers_schema = mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },
    assignedComplaints: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Complaint",
      },
    ],
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
    ratings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Rating",
      },
    ],
    averageRating: {
      type: Number,
    },
    level: { type: Number },
    points: { type: Number },
  },
  { versionKey: false }
);

module.exports = mongoose.model("ServiceProvider", service_providers_schema);
