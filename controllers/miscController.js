// IMPORTED REQUIRED PACKAGES
const { fs, path } = require("../utils/packages");

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

// this function will store the uploaded image on the server and sends back
// a link of that image to the frontend as a response...
exports.uploadProfilePicture = (req, res) => {
  try {
    fs.readFileSync(
      path.join(__dirname, "../", "/public/static/" + req.file.filename)
    );
    const imgPath = req.file.path;
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

// this will remove/delete the uploaded image from the server, when the user
// clicks on 'x' button or undo the operation...
exports.deleteUploadedImage = (req, res) => {
  try {
    if (!req.params.img) {
      res.send({
        status: 500,
        success: false,
        message: err.message,
      });
    } else {
      const directory = path.join(
        __dirname,
        "../" + "/public/static/" + req.params.img
      );
      fs.unlinkSync(directory);
      res.send({
        status: 200,
        success: true,
        message: "IMAGE IS SUCCESSFULLY DELETED!",
      });
    }
  } catch (err) {
    console.log("ERROR: " + err.message);
  }
};
