const express = require("express");
const misc_router = express.Router();
const multer = require("multer");
const path = require("path");

// CONTROLLERS
const miscController = require("../controllers/miscController");

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
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
});

// UPLOAD IMAGE ROUTE
misc_router.post(
  "/upload/images",
  upload.single("img"),
  miscController.uploadProfilePicture
);

// DATABASE CLEANING ROUTES
// misc_router.delete("/deleteAll", miscController.deleteAll);

module.exports = misc_router;
