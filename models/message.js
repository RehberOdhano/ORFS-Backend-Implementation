const mongoose = require("mongoose");

const messageSchema = mongoose.Schema(
  {
    conversation_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    message: {
      type: String,
    },
  },
  { versionKey: false }
);

module.exports = mongoose.model("Message", messageSchema);
