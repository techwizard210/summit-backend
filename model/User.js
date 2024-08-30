const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  companyName: {
    type: String,
  },
  teamNumber: {
    type: Number,
  },
  location: {
    type: String,
  },
  password: {
    type: String,
  },
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
