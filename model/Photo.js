const mongoose = require("mongoose");

const PhotoSchema = new mongoose.Schema({
  path: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  clueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Clue",
    required: true,
  },
  locationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Location",
    required: true,
  },
});

const Photo = mongoose.model("Photo", PhotoSchema);

module.exports = Photo;
