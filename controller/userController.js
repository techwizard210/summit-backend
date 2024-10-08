const Photo = require("../model/Photo");
const User = require("../model/User");
const Location = require("../model/Location");
const Clue = require("../model/Clue");
const { ObjectId } = require("mongodb");

exports.uploadPhoto = async (req, res) => {
  if (!req.file) {
    return res.send({ message: "No file uploaded." });
  }
  const { clueId, locationId, userId } = req.body;
  const newUserId = new ObjectId(userId);
  const newLocationId = new ObjectId(locationId);
  const newClueId = new ObjectId(clueId);

  let photo = await Photo.findOne({ userId: newUserId, clueId: newClueId });
  if (photo) {
    photo.path = req.file.filename;
    await photo.save();
  } else {
    const newPhoto = new Photo({
      path: req.file.filename,
      userId: newUserId,
      clueId: newClueId,
      locationId: newLocationId,
    });
    await newPhoto.save();
  }
  res.send({ message: "success" });
};

exports.login = async (req, res) => {
  const { companyName, teamNumber, password } = req.body;
  const user = await User.findOne({
    companyName,
    teamNumber,
    password,
  });
  if (user) {
    res.send({
      message: "success",
      user,
    });
  } else {
    res.send({
      message: "wrong credentials",
    });
  }
};

exports.getLocationById = async (req, res) => {
  const { userId } = req.body;
  const newUserId = new ObjectId(userId);
  const user = await User.findOne({ _id: newUserId });
  const locationArr = user.location.split(",");
  let arr = [];
  const getNameArr = async () => {
    for (const location of locationArr) {
      const id = new ObjectId(location);
      const l = await Location.findOne({ _id: id });
      arr.push(l);
    }
  };

  await getNameArr();

  res.send({
    message: "success",
    locations: arr,
  });
};

exports.getCluesById = async (req, res) => {
  const { userId } = req.body;
  const newUserId = new ObjectId(userId);
  const currentUser = await User.findOne({ _id: newUserId });
  const newLocationId = new ObjectId(currentUser.location);
  const locationName = await Location.findOne({ _id: newLocationId });
  const clues = await Clue.find({ locationId: newLocationId });
  if (clues) {
    let newClues = [];
    const getClues = async () => {
      for (const clue of clues) {
        const photo = await Photo.findOne({
          userId: newUserId,
          clueId: clue._id,
        });
        let obj = {
          _id: clue._id,
          title: clue.title,
          point: clue.point,
          description: clue.description,
          path: clue.path,
          locationId: clue.locationId,
        };
        if (photo) {
          obj.uploadedPath = photo.path;
        }
        newClues.push(obj);
      }
    };
    await getClues();
    res.send({
      message: "success",
      clues: newClues,
      locationName,
    });
  }
};
