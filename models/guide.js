const mongoose = require("mongoose");

const guideSchema = mongoose.Schema(
  {
    title: {
      type: String,
    },
    content: {
      type: String,
    },
    videoLink: {
      type: String,
    },
  },
  { versionKey: false }
);

module.exports = mongoose.model("Guide", guideSchema);
