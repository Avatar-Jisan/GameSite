const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  username: String,
  level: Number,
  xp: Number,
  maxXp: Number,
  stats: Object,
  activities: Array,
  games: Array
});

module.exports = mongoose.model("User", userSchema);