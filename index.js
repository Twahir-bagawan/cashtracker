require("dotenv").config(); // ✅ Load environment variables

const express = require("express");
const connectDB = require("./config/db");
const userModel = require("./models/usermodel");
const transactionModel = require("./models/transactionmodel");

const app = express();

// ✅ View engine & middleware setup
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// ✅ Connect to MongoDB
connectDB();

// ✅ Home route
app.get("/", (req, res) => {
  res.redirect("/profile");
});

// ✅ Profile page - shows all users
app.get("/profile", async (req, res) => {
  try {
    const users = await userModel.find();
    res.render("profile", { users });
  } catch (error) {
    console.error("❌ Error fetching profile:", error);
    res.status(500).send("Internal Server Error");
  }
});

// ✅ Create user page
app.get("/create", (req, res) => {
  res.render("create");
});

// ✅ Handle new user creation
app.post("/profile", async (req, res) => {
  try {
    const { username, balance } = req.body;
    await userModel.create({ username, balance });
    console.log("✅ User created successfully");
    res.redirect("/profile");
  } catch (error) {
    console.error("❌ Error creating user:", error);
    res.status(500).send("Internal Server Error");
  }
});

// ✅ Show Add/Reduce form
app.get("/transaction/:userId/:type", async (req, res) => {
  try {
    const { userId, type } = req.params;
    const user = await userModel.findById(userId);
    res.render("transaction", { user, type });
  } catch (error) {
    console.error("❌ Error loading transaction page:", error);
    res.status(500).send("Internal Server Error");
  }
});

// ✅ Handle Add/Reduce form submission
app.post("/transaction/:userId/:type", async (req, res) => {
  try {
    const { userId, type } = req.params;
    const { amount } = req.body;

    const user = await userModel.findById(userId);
    if (!user) return res.status(404).send("User not found");

    const amt = Number(amount);

    // Update balance
    if (type === "add") user.balance += amt;
    else if (type === "reduce") user.balance -= amt;

    await user.save();

    // Create transaction
    await transactionModel.create({
      userId,
      type,
      amount: amt,
    });

    res.redirect("/profile");
  } catch (error) {
    console.error("❌ Error processing transaction:", error);
    res.status(500).send("Internal Server Error");
  }
});

// ✅ Transaction history
app.get("/history/:userId", async (req, res) => {
  try {
    const user = await userModel.findById(req.params.userId);
    const transactions = await transactionModel
      .find({ userId: req.params.userId })
      .sort({ date: -1 });
    res.render("history", { user, transactions });
  } catch (error) {
    console.error("❌ Error loading history:", error);
    res.status(500).send("Internal Server Error");
  }
});

// ✅ Search users by username
app.get("/search", async (req, res) => {
  try {
    const query = req.query.query?.trim() || "";
    const users = await userModel.find({
      username: { $regex: query, $options: "i" },
    });
    res.render("profile", { users });
  } catch (error) {
    console.error("❌ Error while searching:", error);
    res.status(500).send("Internal Server Error");
  }
});

// ✅ Edit user
app.get("/edit/:id", async (req, res) => {
  try {
    const user = await userModel.findById(req.params.id);
    if (!user) return res.status(404).send("User not found");
    res.render("edit", { user });
  } catch (error) {
    console.error("❌ Error loading edit page:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/edit/:id", async (req, res) => {
  try {
    const { username } = req.body;
    await userModel.findByIdAndUpdate(req.params.id, { username });
    res.redirect("/profile");
  } catch (error) {
    console.error("❌ Error updating user:", error);
    res.status(500).send("Internal Server Error");
  }
});

// ✅ Start Server (works locally & on Render)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
