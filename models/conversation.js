const mongoose = require("mongoose");

const conversationSchema = mongoose.Schema(
  {
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { versionKey: false }
);

module.exports = mongoose.model("Conversation", conversationSchema);
