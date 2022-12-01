const mongoose = require("mongoose");

const conversationSchema = mongoose.Schema(
  {
    members: {
      type: Array,
      ref: "User",
    },
  },
  { versionKey: false }
);

module.exports = mongoose.model("Conversation", conversationSchema);
