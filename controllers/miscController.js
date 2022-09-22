// PACKAGES
const fs = require("fs");
const path = require("path");

// MODELS
// const Customer = require("../models/customer");
// const Category = require("../models/category");
// const User = require("../models/user");

/*
=============================================================================
|                         DATABASE CLEANING ROUTES                          |
=============================================================================
*/

// FOR DATABASE CLEANSING...
// exports.deleteAll = (req, res) => {
//   try {
//     Category.deleteMany({}).exec((err, result) => {
//       if (err) throw err;
//       else res.send("SUCCESSFULLY DELETED");
//     });
//   } catch (err) {
//     console.log("ERROR: " + err.message);
//   }
// };

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
