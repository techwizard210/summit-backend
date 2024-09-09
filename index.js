const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();

const User = require("./model/User");

app.options("*", cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use(express.static("public"));
require("dotenv").config();

const {
  uploadPhoto,
  login,
  getLocationById,
  getCluesById,
} = require("./controller/userController");

const {
  adminLogin,
  addLocation,
  getLocations,
  editLocation,
  deleteLocation,
  getLocationsById,
  getLocationsByKey,
  addClue,
  getClues,
  editClue,
  getClueById,
  getCluesByKey,
  deleteClue,
  addTeam,
  getTeams,
  getTeamsByKey,
  deleteTeam,
  saveTeamDetail,
  getPhotos,
  getPhotosById,
  downloadPhoto,
} = require("./controller/adminController");

const port = process.env.PORT;
const MongoURI = process.env.MONGOURI;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/"); // Directory to save uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Unique file name
  },
});

const upload = multer({ storage: storage });

// Create 'uploads' folder if it doesn't exist
const fs = require("fs");
if (!fs.existsSync("public")) {
  fs.mkdirSync("public");
}
if (!fs.existsSync("public/uploads")) {
  fs.mkdirSync("public/uploads");
}

// User Routes
app.post("/login", login);
app.post("/getLocationById", getLocationById);
app.post("/getCluesById", getCluesById);

// File upload endpoint
app.post("/upload", upload.single("file"), uploadPhoto);

// Admin Routes
app.post("/adminLogin", adminLogin);

app.post("/addLocation", addLocation);
app.get("/getLocations", getLocations);
app.post("/getLocationsByKey", getLocationsByKey);
app.post("/deleteLocation", deleteLocation);
app.post("/getLocationsById", getLocationsById);
app.post("/editLocation", editLocation);

app.post("/addClue", upload.single("file"), addClue);
app.get("/getClues", getClues);
app.post("/deleteClue", deleteClue);
app.post("/editClue", upload.single("file"), editClue);
app.post("/getClueById", getClueById);
app.post("/getCluesByKey", getCluesByKey);

app.post("/addTeam", addTeam);
app.get("/getTeams", getTeams);
app.post("/getTeamsByKey", getTeamsByKey);
app.post("/deleteTeam", deleteTeam);
app.post("/saveTeamDetail", saveTeamDetail);

app.get("/getPhotos", getPhotos);
app.post("/getPhotosById", getPhotosById);
app.get("/downloadPhoto", downloadPhoto);

app.get("/", res.send("success"));

const runApp = async () => {
  // connect mongodb
  await mongoose
    .connect(MongoURI)
    .then(() => console.log("MongoDB connected..."))
    .catch((err) => console.log(err));

  // create admin user
  const admin = new User({
    companyName: "admin",
    password: ADMIN_PASSWORD,
  });
  await admin.save();

  // run app
  app.listen(port, () => {
    console.log(`Server running on ${port}`);
  });
};

runApp();
