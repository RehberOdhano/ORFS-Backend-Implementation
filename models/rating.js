const mongoose = require("mongoose");

const ratingSchema = mongoose.Schema(
  {
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },
    complainee_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complainee",
    },
    serviceprovider_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceProvider",
    },
    complaint_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complaint",
    },
    rating_level: {
      type: Number,
    },
    review: {
      type: String,
    },
  },
  { versionKey: false }
);

module.exports = mongoose.model("Rating", ratingSchema);
