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

  achievements: {
    type: Array,
    default: [
      { name: "First Blood", progress: 0, completed: false },
      { name: "Grinder", progress: 0, completed: false },
      { name: "Veteran", progress: 0, completed: false },
      { name: "Champion", progress: 0, completed: false },
      { name: "Unstoppable", progress: 0, completed: false },
      { name: "Legend", progress: 0, completed: false },
      { name: "Memory Master", progress: 0, completed: false },
      { name: "Ludo King", progress: 0, completed: false },
      { name: "Night Owl", progress: 0, completed: false },
      { name: "Daily Player", progress: 0, completed: false }
    ]
  },
  totalWins: { type: Number, default: 0 },
  memoryWins: { type: Number, default: 0 },
  ludoWins: { type: Number, default: 0 }
});

module.exports = mongoose.model("User", userSchema);