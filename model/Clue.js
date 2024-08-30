const mongoose = require("mongoose");

const ClueSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  point: {
    type: Number,
  },
  description: {
    type: String,
  },
  path: {
    type: String,
  },
  locationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Location",
    required: true,
  },
});

const Clue = mongoose.model("Clue", ClueSchema);

module.exports = Clue;
