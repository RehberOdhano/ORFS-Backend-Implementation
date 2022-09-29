// IMPORTED REQUIRED PACKAGES
const { express, multer } = require("../utils/packages");

// ROUTER
const misc_router = express.Router();

// CONTROLLERS
const miscController = require("../controllers/miscController");

/*
=============================================================================
|                                   ROUTES                                  |
=============================================================================
*/

// UPLOADING & DELETEING IMAGE ROUTES
misc_router.post("/upload/images", miscController.uploadProfilePicture);

misc_router.delete("/delete/image/:img", miscController.deleteUploadedImage);

// DATABASE CLEANING ROUTES
// misc_router.delete("/deleteAll", miscController.deleteAll);

module.exports = misc_router;
