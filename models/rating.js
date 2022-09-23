const mongoose = require("mongoose");

const ratingSchema = mongoose.Schema(
  {
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
    },
    complainee_id: {
      type: mongoose.Schema.Types.ObjectId,
    },
    serviceprovider_id: {
      type: mongoose.Schema.Types.ObjectId,
    },
    complaint_id: {
      type: mongoose.Schema.Types.ObjectId,
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
