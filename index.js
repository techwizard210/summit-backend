const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const app = express();

app.options("*", cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use(express.static("public"));
require("dotenv").config();

const port = process.env.PORT;

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
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  // Return success response with uploaded file info
  res
    .status(200)
    .json({ message: "File uploaded successfully", file: req.file });
});

app.get("/", (req, res) => {
  res.send("ok, server is working");
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on ${port}`);
});
