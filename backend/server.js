const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const User = require("./models/User");
const bcrypt = require("bcrypt");
const app = express();
app.use(cors());
app.use(express.json());

/* -------- CONNECT MONGODB -------- */
mongoose.connect("mongodb://abdullaaljisan_db_user:djaGgE8t1ZxtzBiF@ac-8ij9fpx-shard-00-00.lcl9fhm.mongodb.net:27017,ac-8ij9fpx-shard-00-01.lcl9fhm.mongodb.net:27017,ac-8ij9fpx-shard-00-02.lcl9fhm.mongodb.net:27017/KheloDataBase?ssl=true&replicaSet=atlas-3wjbfu-shard-0&authSource=admin&appName=Cluster0")
  .then(() => console.log("MongoDB Connected ✅"))
  .catch(err => console.log("DB Connection Error: ", err));

/* -------- ROUTES -------- */

// 1.Register
app.post("/api/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists"
      });
    }

    // 🔐 HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,

      name: username, // 👈 IMPORTANT
      bio: "Ready to play 🎮",
      joinDate: new Date().toDateString(),
      profileImage: "assets/avatar_img.avif",

      xp: 0,
      maxXp: 100,
      level: 1,

      stats: {
        gamesPlayed: 0,
        hoursPlayed: 0,
        winRate: 0,
        streak: 0
      },

      games: [],
      activities: [],

      achievements: [
        { name: "First Blood", progress: 0 },
        { name: "Streak King", progress: 0 },
        { name: "Puzzle Master", progress: 0 },
        { name: "Night Owl", progress: 0 }
      ]
    });

    await newUser.save();

    res.json({
      success: true,
      message: "Registration successful"
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2.Login
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found"
      });
    }

    // 🔐 COMPARE PASSWORD
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Wrong password"
      });
    }

    // ❗ NEVER SEND PASSWORD BACK
    const userData = user.toObject();
    delete userData.password;

    res.json({
      success: true,
      message: "Login success",
      user: userData
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/user/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const userData = user.toObject();
    delete userData.password;

    res.json(userData);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.put("/api/user/:id", async (req, res) => {
  try {
    const updates = req.body;

    // password hashing if updated
    if (updates.password) {
      const bcrypt = require("bcrypt");
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );

    res.json({ success: true, user });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3.Test Route
app.get("/", (req, res) => res.send("Backend running 🚀"));

/* -------- START SERVER -------- */
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});

app.post("/api/game-result", async (req, res) => {
  try {
    const data = req.body;

    const user = await User.findById(data.userId);

    if (!user) return res.json({ error: "User not found" });

    /* -------- GLOBAL STATS -------- */

    user.xp += data.xpEarned;
    user.xp += data.xpEarned;

    // 🔥 LEVEL UP SYSTEM
    while (user.xp >= user.maxXp) {
      user.xp -= user.maxXp;
      user.level += 1;
      user.maxXp = Math.floor(user.maxXp * 1.5); // increase difficulty
    }

    user.stats.gamesPlayed += 1;
    user.stats.hoursPlayed += data.timePlayed / 3600;

    /* -------- GAME-SPECIFIC -------- */

    let game = user.games.find(g => g.name === data.game);

    if (!game) {
      game = {
        name: data.game,
        played: 0,
        wins: 0,
        score: 0
      };
      user.games.push(game);
    }

    game.played += 1;
    game.score += data.score;

    if (data.win) {
      game.wins += 1;
    }

    /* -------- WIN RATE -------- */

    game.winRate = Math.round((game.wins / game.played) * 100);

    /* -------- ACHIEVEMENTS -------- */

    if (!user.achievements || user.achievements.length === 0) {
      user.achievements = [
        { name: "First Blood", progress: 0 },
        { name: "Streak King", progress: 0 },
        { name: "Puzzle Master", progress: 0 },
        { name: "Night Owl", progress: 0 }
      ];
    }

    // First Blood (play 1 game)
    user.achievements[0].progress = Math.min(
      100,
      (user.stats.gamesPlayed / 1) * 100
    );

    // Streak King (10 streak)
    user.achievements[1].progress = Math.min(
      100,
      (user.stats.streak / 10) * 100
    );

    // Puzzle Master (500 games)
    user.achievements[2].progress = Math.min(
      100,
      (user.stats.gamesPlayed / 500) * 100
    );
    // 🌙 Night Owl (play at night)
    const hour = new Date().getHours();

    if (hour >= 20 || hour <= 5) {
      user.achievements[3].progress += 10;

      if (user.achievements[3].progress > 100) {
        user.achievements[3].progress = 100;
      }
    }

    /* -------- ACTIVITY -------- */

    user.activities.unshift({
      text: `Played ${data.game} - ${data.result || `Rank ${data.rank}`}`,
      xp: data.xpEarned,
      time: "Just now"
    });

    /* -------- STREAK SYSTEM (BASIC) -------- */

    const today = new Date().toDateString();

    if (user.lastPlayedDate === today) {
      // same day → do nothing
    } else {
      user.streak = (user.streak || 0) + 1;
      user.lastPlayedDate = today;
    }

    await user.save();

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/test-db", async (req, res) => {
  const users = await User.find();
  res.json(users);
});