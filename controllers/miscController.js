// IMPORTED REQUIRED PACKAGES
const { fs, path, multer } = require("../utils/packages");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

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

// STRIPE PAYMENT
exports.addPayment = (req, res) => {
  try {
    stripe.charges
      .create({
        amount: 100,
        source: req.body.stripeTokenId,
        currency: "usd",
      })
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (err) {
    console.error("ERROR:" + err.message);
  }
};
