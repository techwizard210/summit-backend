const { ObjectId } = require("mongodb");

const Location = require("../model/Location");
const Clue = require("../model/Clue");

exports.addLocation = async (req, res) => {
  const { locationName } = req.body;
  const isExist = await Location.findOne({ name: locationName });
  if (isExist) {
    res.send({ message: "already registered location name" });
  } else {
    const newLocation = new Location({
      name: locationName,
    });
    await newLocation.save();
    res.send({
      message: "success",
    });
  }
};

exports.getLocations = async (req, res) => {
  const locations = await Location.find();
  res.send({
    message: "success",
    locations: locations,
  });
};

exports.deleteLocation = async (req, res) => {
  const { id } = req.body;
  const newId = new ObjectId(id);
  const deletedItem = await Location.findByIdAndDelete(newId);
  if (deletedItem) {
    const locations = await Location.find();
    res.send({
      message: "success",
      locations: locations,
    });
  }
};

exports.addClue = async (req, res) => {
  const filename = req.file.filename;
  const { title, value, description, locationId } = req.body;
  const newLocationId = new ObjectId(locationId);
  const newClue = new Clue({
    title,
    point: value,
    description,
    path: filename,
    locationId: newLocationId,
  });
  await newClue.save();
  res.send({
    message: "success",
    newClue,
  });
};

exports.getClues = async (req, res) => {
  const clues = await Clue.find({}).populate("locationId");
  res.send({
    message: "success",
    clues,
  });
};

exports.addTeam = async (req, res) => {
  const { companyName, teamNumber, password } = req.body;
  const newTeam = new User({
    companyName,
    teamNumber,
    location: "",
    password,
  });
  await newTeam.save();
  res.send({
    message: "success",
    newTeam,
  });
};

exports.getTeams = async (req, res) => {
  const teams = await User.find({});
  res.send({
    message: "success",
    teams,
  });
};
