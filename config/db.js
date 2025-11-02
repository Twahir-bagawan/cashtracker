const mongoose = require("mongoose");
require("dotenv").config(); // Load environment variables

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI); // Use .env variable
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
  }
}

module.exports = connectDB;
