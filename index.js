const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();

app.options("*", cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use(express.static("public"));
require("dotenv").config();

const { uploadPhoto } = require("./controller/userController");

const {
  addLocation,
  getLocations,
  deleteLocation,
  addClue,
  getClues,
} = require("./controller/adminController");

const port = process.env.PORT;
const MongoURI = process.env.MONGOURI;

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

// File upload endpoint
app.post("/upload", upload.single("file"), uploadPhoto);
app.post("/addLocation", addLocation);
app.get("/getLocations", getLocations);
app.get("/getClues", getClues);
app.post("/deleteLocation", deleteLocation);
app.post("/addClue", upload.single("file"), addClue);

// Start the server
app.listen(port, () => {
  console.log(`Server running on ${port}`);
});

mongoose
  .connect(MongoURI)
  .then(() => console.log("MongoDB connected..."))
  .catch((err) => console.log(err));
