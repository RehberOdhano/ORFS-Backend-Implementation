// IMPORTED REQUIRED PACKAGES
const { express } = require("../utils/packages");

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

// UPLOADING & DELETING AUDIO FILES
// misc_router.post("/upload/audio", miscController.uploadAudioFile);

// DATABASE CLEANING ROUTES
// misc_router.delete("/deleteAll", miscController.deleteAll);

// UPDATE/CHANGE PROFILE SETTINGS
misc_router.put("/update/profile/:id", miscController.updateProfileSettings);

// PAYMENT USING STRIPE - TESTING
misc_router.post("/add/payment", miscController.addPayment);

module.exports = misc_router;
