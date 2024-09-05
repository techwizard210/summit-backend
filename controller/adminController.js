const archiver = require("archiver");
const fs = require("fs");
const path = require("path");

const { ObjectId } = require("mongodb");

const Location = require("../model/Location");
const Clue = require("../model/Clue");
const User = require("../model/User");
const Photo = require("../model/Photo");

exports.adminLogin = async (req, res) => {
  const { password } = req.body;
  const admin = await User.findOne({ companyName: "admin" });
  if (password === admin.password) {
    res.send({
      message: "success",
    });
  } else {
    res.send({
      message: "Wrong credential",
    });
  }
};

exports.addLocation = async (req, res) => {
  const { locationName, locationId } = req.body;
  const newLocationId = new ObjectId(locationId);
  const isExist = await Location.findOne({ name: locationName });
  if (isExist) {
    res.send({ message: "already registered location name" });
  } else {
    const newLocation = new Location({
      name: locationName,
    });
    await newLocation.save();
    const clues = await Clue.find({ locationId: newLocationId });
    for (const clue of clues) {
      const newClue = new Clue({
        title: clue.title,
        point: clue.point,
        description: clue.description,
        path: clue.path == undefined ? "" : clue.path,
        locationId: newLocation._id,
      });
      await newClue.save();
    }
    res.send({
      message: "success",
    });
  }
};

exports.editLocation = async (req, res) => {
  const { locationName, locationId } = req.body;
  const newLocationId = new ObjectId(locationId);
  let location = await Location.findOne({ _id: newLocationId });
  location.name = locationName;
  await location.save();
  res.send({
    message: "success",
  });
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
    team,
  });
};

exports.getLocationsByKey = async (req, res) => {
  const { searchKey } = req.body;
  const locations = await Location.find({
    name: { $regex: searchKey, $options: "i" },
  });
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

exports.editClue = async (req, res) => {
  const { title, value, description, locationId, editId, imgState } = req.body;
  let clue = await Clue.findOne({ _id: editId });
  clue.title = title;
  clue.point = value;
  clue.description = description;
  if (req.file) {
    clue.path = req.file.filename;
  }
  if (imgState === "false") {
    clue.path = "";
  }
  clue.locationId = locationId;
  await clue.save();
  res.send({
    message: "success",
  });
};

exports.getClues = async (req, res) => {
  const clues = await Clue.find({}).populate("locationId");
  res.send({
    message: "success",
    clues,
  });
};

exports.getClueById = async (req, res) => {
  const { clueId } = req.body;
  const newClueId = new ObjectId(clueId);
  const clue = await Clue.findOne({ _id: newClueId });
  const locations = await Location.find({});
  res.send({
    message: "success",
    clue,
    locations,
  });
};

exports.getCluesByKey = async (req, res) => {
  const { searchKey } = req.body;
  const clues = await Clue.find()
    .populate({
      path: "locationId",
      match: {
        name: { $regex: searchKey, $options: "i" },
      },
    })
    .exec();
  const filteredClues = clues.filter((clue) => clue.locationId !== null);
  res.send({
    message: "success",
    clues: filteredClues,
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
  const teams = await User.find({
    companyName: { $ne: "admin" },
  });
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

exports.getTeamsByKey = async (req, res) => {
  const { searchKey } = req.body;
  const teams = await User.find({
    $and: [
      {
        companyName: { $ne: "admin" },
      },
      {
        companyName: { $regex: searchKey, $options: "i" },
      },
    ],
  });
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
  const { locations, teamId, companyName, teamNumber } = req.body;
  const newTeamId = new ObjectId(teamId);
  let newLocation = [];
  for (const location of locations) {
    if (location.checked === true) {
      newLocation.push(location._id);
    }
  }
  const team = await User.findOne({ _id: newTeamId });
  team.location = newLocation.join(",");
  team.companyName = companyName;
  team.teamNumber = teamNumber;
  await team.save();
  res.send({
    message: "success",
  });
};

exports.getPhotos = async (req, res) => {};

exports.getPhotosById = async (req, res) => {
  const { teamId, locationId } = req.body;
  const newTeamId = new ObjectId(teamId);
  const newLocationId = new ObjectId(locationId);

  const photos = await Photo.find({
    userId: newTeamId,
    locationId: newLocationId,
  }).populate("clueId");

  res.send({
    message: "success",
    photos,
  });
};

exports.downloadPhoto = async (req, res) => {
  const locationId = req.query.locationId;
  const teamId = req.query.teamId;
  const newLocationId = new ObjectId(locationId);
  const newTeamId = new ObjectId(teamId);

  const zipFileName = "summit.zip";
  res.setHeader("Content-Disposition", `attachment; filename=${zipFileName}`);
  res.setHeader("Content-Type", "application/zip");

  const archive = archiver("zip", {
    zlib: { level: 9 },
  });

  archive.pipe(res);

  const photos = await Photo.find({
    userId: newTeamId,
    locationId: newLocationId,
  });

  for (let photo of photos) {
    const filePath = path.join(__dirname, "../public/uploads", photo.path);
    if (fs.existsSync(filePath)) {
      archive.file(filePath, { name: photo.path });
    } else {
      console.error(`File not found: ${photo.path}`);
    }
  }

  archive.finalize();
};
