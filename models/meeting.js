const mongoose = require("mongoose");

const meetingSchema = mongoose.Schema(
  {
    meetingId: {},
  },
  { versionKey: false }
);

module.exports = mongoose.model("Meeting", meetingSchema);
