// PACKAGES
const fs = require("fs");
const path = require("path");

// MODELS
const Customer = require("../models/customer");

/*
=============================================================================
|                         UPLOAD IMAGE ROUTES                               |
=============================================================================
*/

exports.uploadProfilePicture = (req, res) => {
  try {
    const pfp = {
      data: fs.readFileSync(
        path.join(__dirname, "../", "/public/static/" + req.file.filename)
      ),
      contentType: req.file.mimetype,
    };
    const imgPath = req.file.path;
    console.log(imgPath)
    res.send({
      status: 200,
      success: true,
      data: {
        imgPath: imgPath,
      },
    });
  } catch (err) {
    console.log("ERROR: " + err.message);
  }
};
