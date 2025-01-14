// IMPORTED REQUIRED PACKAGES
const { fs, path, multer, busboy } = require("../utils/packages");
const { randomFillSync } = require("crypto");

// MODELS
// const Customer = require("../models/customer");
// const Category = require("../models/category");
const User = require("../models/user");

// HELPER FUNCTIONS FOR IMAGE UPLOAD
const fileStorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/static");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + file.originalname);
  },
});

const upload = multer({
  storage: fileStorageEngine,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5 MBs
  },
  fileFilter: (req, file, cb) => {
    if (file.size > 1024 * 1024 * 5) {
      return cb(new Error("FILES SIZE SHOULD NOT BE MORE THAN 5MBs!"));
    } else {
      if (
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpeg"
      ) {
        cb(null, true);
      } else {
        return cb(new Error("ONLY PNG/JPG/JPEG FILES ARE ALLOWED!"));
      }
    }
  },
}).single("img");

const random = (() => {
  const buffer = Buffer.alloc(16);
  return () => randomFillSync(buffer).toString("hex");
})();

const maxFileSize = 1024 * 1024 * 5; // 5MBs;
const mimeTypes = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "audio/mpeg",
  "video/mp4",
];

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
//     console.error("ERROR: " + err.message);
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
    upload(req, res, (err) => {
      if (err instanceof multer.MulterError || err) {
        res.send({
          status: 500,
          success: false,
          message: err.message,
        });
      } else {
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
      }
    });
  } catch (err) {
    console.error("ERROR: " + err.message);
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
    console.error("ERROR: " + err.message);
  }
};

// CHANGE/UPDATE PROFILE SETTINGS
exports.updateProfileSettings = (req, res) => {
  try {
    const { name, email, pfp } = req.body;
    const user_id = req.params.id;
    User.updateOne(
      { _id: user_id },
      { name, email, pfp },
      { multi: false, runValidators: true }
    ).exec((err, user) => {
      if (err) {
        res.send({
          status: 500,
          success: false,
          message: err.message,
        });
      } else {
        res.send({
          status: 200,
          success: true,
          message: "PROFILE IS SUCCESSFULLY UPDATED!",
        });
      }
    });
  } catch (err) {
    console.error("ERROR:" + err.message);
  }
};

// UPLOAD FILES (IMAGES, AUDIO OR VIDEO)
exports.uploadMedia = (req, res) => {
  try {
    const bb = busboy({
      headers: req.headers,
      limits: { fileSize: maxFileSize },
    });
    bb.on("file", (fieldname, file, info) => {
      const { filename, mimeType } = info;
      const saveTo = path.join(
        __dirname,
        "../" + "/public/uploads/" + `${random()}--${filename}`
      );
      const fileSize = req.headers["content-length"];
      var errMsg = "";
      // check for empty field
      if (filename.length > 0) {
        if (mimeTypes.indexOf(mimeType) !== -1) {
          if (fileSize <= maxFileSize) {
            const stream = fs.createWriteStream(saveTo);
            file.pipe(stream);
          } else {
            errMsg = "FILES LARGER THAN 5MBs CAN'T BE UPLOADED!";
          }
        } else {
          errMsg = "ONLY PNG/JPG/JPEG/MP4/MPEG FILES ARE ALLOWED!";
        }
      } else errMsg = "PLEASE UPLOAD A FILE!";

      if (errMsg) {
        res.send({
          status: 404,
          success: false,
          message: errMsg,
        });
      } else {
        file.on("close", () => {
          res.send({
            status: 200,
            success: true,
            message: "FILE IS SUCCESSFULLY UPLOADED!",
            filePath: `/public/uploads/${filename}`,
          });
        });
      }
    });

    bb.on("err", (err) => {
      res.send({
        status: 404,
        success: false,
        message: err.message,
      });
    });

    req.pipe(bb);
    return;
  } catch (err) {
    console.error("ERROR:" + err.message);
  }
};

// exports.uploadImageToS3 = (req, res) => {
//   try {
//     upload(req, res, (err) => {
//       if (err instanceof multer.MulterError || err) {
//         res.send({
//           status: 500,
//           success: false,
//           message: err.message,
//         });
//       } else {
//         fs.readFileSync(
//           path.join(__dirname, "../", "/public/s3/" + req.file.filename)
//         );
//         const imgPath = req.file.path;

//         res.send({
//           status: 200,
//           success: true,
//           data: {
//             imgPath: imgPath,
//           },
//         });
//       }
//     });
//   } catch (err) {
//     console.error("ERROR:" + err.message);
//   }
// };
