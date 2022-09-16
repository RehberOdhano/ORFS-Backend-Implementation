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

    // Customer.findByIdAndUpdate({ _id: company_id }, pfp).exec(
    //   (err, customer) => {
    //     if (err) {
    //       res.send({
    //         status: 404,
    //         success: true,
    //         message: err.message,
    //       });
    //     } else {
    //       res.send({
    //         status: 200,
    //         success: true,
    //         message: "IMAGE IS SUCCESSFULLY UPLOADED!",
    //       });
    //     }
    //   }
    // );
  } catch (err) {
    console.log("ERROR: " + err.message);
  }
};
