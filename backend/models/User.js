const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,

  // 🔥 ADD THESE
  name: { type: String, default: "" },
  bio: { type: String, default: "New player 🚀" },
  joinDate: { type: String, default: new Date().toDateString() },
  profileImage: { type: String, default: "assets/avatar_img.avif" },

  xp: { type: Number, default: 0 },
  maxXp: { type: Number, default: 100 },
  level: { type: Number, default: 1 },

  stats: {
    gamesPlayed: { type: Number, default: 0 },
    hoursPlayed: { type: Number, default: 0 },
    winRate: { type: Number, default: 0 },
    streak: { type: Number, default: 0 }
  },

  games: { type: Array, default: [] },
  activities: { type: Array, default: [] },

  // 🔥 ADD THIS (IMPORTANT)
  achievements: {
    type: Array,
    default: [
      { name: "First Blood", progress: 0 },
      { name: "Streak King", progress: 0 },
      { name: "Puzzle Master", progress: 0 },
      { name: "Night Owl", progress: 0 }
    ]
  }
});

module.exports = mongoose.model("User", userSchema);