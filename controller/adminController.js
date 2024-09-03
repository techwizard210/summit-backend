const { ObjectId } = require("mongodb");

const Location = require("../model/Location");
const Clue = require("../model/Clue");
const User = require("../model/User");

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

exports.getLocationsById = async (req, res) => {
  const { teamId } = req.body;
  const newTeamId = new ObjectId(teamId);
  const team = await User.findOne({ _id: newTeamId });
  const locations = await Location.find({});

  const teamLocations = team.location.split(",");
  const newLocations = [];
  locations.forEach((location) => {
    let count = 0;
    teamLocations.forEach((teamLocation) => {
      if (teamLocation === location._id.toString()) {
        count++;
      }
    });
    if (count > 0) {
      newLocations.push({
        _id: location._id,
        name: location.name,
        checked: true,
      });
    } else {
      newLocations.push({
        _id: location._id,
        name: location.name,
        checked: false,
      });
    }
  });
  res.send({
    message: "success",
    locations: newLocations,
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
  const { title, value, description, locationId } = req.body;
  const newLocationId = new ObjectId(locationId);
  let newClue = {};
  if (!req.file) {
    newClue = new Clue({
      title,
      point: value,
      description,
      path: "",
      locationId: newLocationId,
    });
  } else {
    newClue = new Clue({
      title,
      point: value,
      description,
      path: req.file.filename,
      locationId: newLocationId,
    });
  }

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

exports.deleteClue = async (req, res) => {
  const { id } = req.body;
  const newId = new ObjectId(id);
  const deletedItem = await Clue.findByIdAndDelete(newId);
  if (deletedItem) {
    const clues = await Clue.find({});
    res.send({
      message: "success",
      clues,
    });
  }
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
  let newTeams = [];

  for (const team of teams) {
    if (!team.location) {
      newTeams.push({
        _id: team._id,
        companyName: team.companyName,
        teamNumber: team.teamNumber,
        location: "",
      });
    } else {
      const locationIds = team.location.split(",");
      let newLocationIds = [];
      locationIds.forEach((id) => {
        const newId = new ObjectId(id);
        newLocationIds.push(newId);
      });

      let locationNames = [];
      for (const id of newLocationIds) {
        const location = await Location.findOne({ _id: id });
        locationNames.push(location.name);
      }
      newTeams.push({
        _id: team._id,
        companyName: team.companyName,
        teamNumber: team.teamNumber,
        location: locationNames.join(", "),
      });
    }
  }
  res.send({
    message: "success",
    teams: newTeams,
  });
};

exports.deleteTeam = async (req, res) => {
  const { id } = req.body;
  const newId = new ObjectId(id);
  const deletedItem = await User.findByIdAndDelete(newId);
  if (deletedItem) {
    const users = await User.find({});
    res.send({
      message: "success",
      users,
    });
  }
};

exports.saveTeamDetail = async (req, res) => {
  const { locations, teamId } = req.body;
  const newTeamId = new ObjectId(teamId);
  let newLocation = [];
  for (const location of locations) {
    if (location.checked === true) {
      newLocation.push(location._id);
    }
  }
  const team = await User.findOne({ _id: newTeamId });
  team.location = newLocation.join(",");
  await team.save();
  res.send({
    message: "success",
  });
};
