const mongoose = require("mongoose");

const complaineeSchema = mongoose.Schema(
  {
    user_id: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },
    complaints: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Complaint",
      },
    ],
    rating: { type: Number },
    level: { type: Number },
    points: { type: Number },
  },
  { versionKey: false }
);

module.exports = mongoose.model("Complainee", complaineeSchema);
