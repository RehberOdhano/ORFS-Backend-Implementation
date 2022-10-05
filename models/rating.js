const mongoose = require("mongoose");

const ratingSchema = mongoose.Schema(
  {
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
<<<<<<< HEAD
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
=======
      ref: "Customer"
    },
    complainee_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complainee"
    },
    serviceprovider_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceProvider"
    },
    complaint_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complaint"
>>>>>>> 7fb886ded24ba9e27b31ab9887b71e71ea63da73
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
