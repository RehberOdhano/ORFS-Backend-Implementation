const express = require("express");
const misc_router = express.Router();
const multer = require("multer");
const path = require("path");

// CONTROLLERS
const miscController = require("../controllers/miscController");

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
});

// UPLOADING & DELETEING IMAGE ROUTES
misc_router.post(
  "/upload/images",
  upload.single("img"),
  miscController.uploadProfilePicture
);

misc_router.delete("/delete/image/:img", miscController.deleteUploadedImage);

// DATABASE CLEANING ROUTES
// misc_router.delete("/deleteAll", miscController.deleteAll);

module.exports = misc_router;
