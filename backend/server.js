const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const User = require("./models/User");

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
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User Already" });
    }

    const newUser = new User({ username, email, password });
    await newUser.save();
    res.status(201).json({ success: true, message: "Registration Successful" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2.Login
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.password !== password) {
      return res.status(400).json({ success: false, message: "Wrong Password" });
    }

    res.json({ success: true, message: "Login Success", user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3.Test Route
app.get("/", (req, res) => res.send("Backend running 🚀"));

/* -------- START SERVER -------- */
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});