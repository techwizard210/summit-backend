const Photo = require("../model/Photo");

exports.uploadPhoto = async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }
  // const newPhoto = new Photo({
  //   path: req.file.filename,
  //   userId: 1,
  //   clueId: 1,
  //   locationId: 1,
  // });

  // await newPhoto.save();
  // const clues = await Clue.find({ locationId: 1 });

  // Return success response with uploaded file info
  // res.status(200).json({ message: "File uploaded successfully", clues: clues });
  res
    .status(200)
    .json({
      message: "File uploaded successfully",
      filename: req.file.filename,
    });
};
