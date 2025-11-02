const mongoose = require("mongoose");

async function connectDB() {
  try {
    await mongoose.connect("mongodb+srv://twahirbagawan:twahir123@cluster0.x1gbfad.mongodb.net/");
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
  }
}

module.exports = connectDB;
