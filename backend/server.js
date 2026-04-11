const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

/* -------- CONNECT MONGODB -------- */

mongoose.connect("mongodb://abdullaaljisan_db_user:djaGgE8t1ZxtzBiF@ac-8ij9fpx-shard-00-00.lcl9fhm.mongodb.net:27017,ac-8ij9fpx-shard-00-01.lcl9fhm.mongodb.net:27017,ac-8ij9fpx-shard-00-02.lcl9fhm.mongodb.net:27017/KheloDataBase?ssl=true&replicaSet=atlas-3wjbfu-shard-0&authSource=admin&appName=Cluster0")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

/* -------- TEST ROUTE -------- */

app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

/* -------- START SERVER -------- */

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});

const User = require("./models/User");

app.get("/api/user", async (req, res) => {
  try {
    const user = await User.findOne();
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});