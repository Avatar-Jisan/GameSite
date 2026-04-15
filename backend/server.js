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
      ],
      totalWins: 0,
      memoryWins: 0,
      ludoWins: 0,
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

    if (data.win) {
      user.totalWins += 1;

      if (data.game === "memory") user.memoryWins += 1;
      if (data.game === "ludo") user.ludoWins += 1;
    }

    const today = new Date();
    const last = new Date(user.lastPlayedDate || 0);

    const diffDays = Math.floor((today - last) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      user.stats.streak += 1; // consecutive day
    } else if (diffDays > 1) {
      user.stats.streak = 1; // reset
    }
    // same day → no change

    user.lastPlayedDate = today;


    const totalWins = user.totalWins || 0;
    const totalGames = user.stats.gamesPlayed || 1;

    user.stats.winRate = Math.round((totalWins / totalGames) * 100);
    /* -------- ACHIEVEMENTS -------- */
    const achievementRewards = [
      100, // First Blood
      200, // Grinder
      500, // Veteran
      150, // Champion
      300, // Unstoppable
      500, // Legend
      400, // Memory Master
      400, // Ludo King
      200, // Night Owl
      250  // Daily Player
    ];

    const ach = user.achievements;

    // 1. First Blood
    if (user.stats.gamesPlayed >= 1) {
      ach[0].progress = 100;
    }

    // 2. Grinder (10 games)
    ach[1].progress = Math.min(100, (user.stats.gamesPlayed / 10) * 100);

    // 3. Veteran (100 games)
    ach[2].progress = Math.min(100, (user.stats.gamesPlayed / 100) * 100);

    // 4. Champion (1 win)
    if (user.totalWins >= 1) {
      ach[3].progress = 100;
    }

    // 5. Unstoppable (5 streak)
    ach[4].progress = Math.min(100, (user.stats.streak / 5) * 100);

    // 6. Legend (level 10)
    ach[5].progress = Math.min(100, (user.level / 10) * 100);

    // 7. Memory Master (20 wins)
    ach[6].progress = Math.min(100, (user.memoryWins / 20) * 100);

    // 8. Ludo King (10 wins)
    ach[7].progress = Math.min(100, (user.ludoWins / 10) * 100);

    // 9. Night Owl
    const hour = new Date().getHours();
    if (hour >= 22 || hour <= 5) {
      ach[8].progress += 20;
    }

    // 10. Daily Player (3 day streak)
    ach[9].progress = Math.min(100, (user.stats.streak / 3) * 100);

    ach.forEach((ach, index) => {

      if (ach.progress >= 100 && !ach.completed) {

        ach.completed = true;

        // ✅ ADD XP REWARD
        user.xp += achievementRewards[index];

        // ✅ OPTIONAL: Add activity
        user.activities.unshift({
          text: `Achievement Unlocked: ${ach.name} 🏆`,
          xp: achievementRewards[index],
          time: "Just now"
        });
      }

    });
    user.markModified("achievements");

    /* -------- ACTIVITY -------- */

    user.activities.unshift({
      text: `Played ${data.game} - ${data.result || `Rank ${data.rank}`}`,
      xp: data.xpEarned,
      time: "Just now"
    });
    console.log("Games Played:", user.stats.gamesPlayed);
    console.log("First Blood Progress:", ach[0].progress);

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