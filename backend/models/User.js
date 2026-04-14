const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true }, 
  password: { type: String, required: true },            
  level: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },
  maxXp: { type: Number, default: 1000 },
  stats: { type: Object, default: {} },
  activities: { type: Array, default: [] },
  games: { type: Array, default: [] }
});

module.exports = mongoose.model("User", userSchema);