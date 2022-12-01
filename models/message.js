const mongoose = require("mongoose");

const messageSchema = mongoose.Schema(
  {
    conversation_id: {
      type: String,
      ref: "Conversation",
    },
    sender: {
      type: String,
      ref: "User",
    },
    message: {
      type: String,
    },
  },
  { versionKey: false }
);

module.exports = mongoose.model("Message", messageSchema);
