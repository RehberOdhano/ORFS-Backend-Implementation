const mongoose = require("mongoose");

const ratingSchema = mongoose.Schema(
  {
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      // required: true
    },
    complainee_id: {
      type: mongoose.Schema.Types.ObjectId,
      // required: true
    },
    serviceprovider_id: {
      type: mongoose.Schema.Types.ObjectId,
      // required: true
    },
    complaint_id: {
      type: mongoose.Schema.Types.ObjectId,
      // required: true
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
