const mongoose = require("mongoose");

const leaderboardSchema = mongoose.Schema({}, { versionKey: false });

module.exports = mongoose.model("Leaderboard", leaderboardSchema);
