const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  role: {
    type: String,
    enum: ["psychologist", "patient"],
    default: "patient",
  },
});

const User = mongoose.model("User", userSchema);
module.exports = User;

