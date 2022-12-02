// IMPORTED REQUIRED PACKAGES
const { express } = require("../utils/packages");

// ROUTER
const miscRouter = express.Router();

// CONTROLLERS
const miscController = require("../controllers/miscController");

/*
=============================================================================
|                                   ROUTES                                  |
=============================================================================
*/

// UPLOADING & DELETEING IMAGE ROUTES
miscRouter.post("/upload/images", miscController.uploadProfilePicture);
miscRouter.delete("/delete/image/:img", miscController.deleteUploadedImage);

// UPLOADING FILES (IMAGES, AUDIO AND VIDEO)
miscRouter.post("/upload/media", miscController.uploadMedia);

// DATABASE CLEANING ROUTES
// miscRouter.delete("/deleteAll", miscController.deleteAll);

// UPDATE/CHANGE PROFILE SETTINGS
miscRouter.put("/update/profile/:id", miscController.updateProfileSettings);

// UPLOADING IMAGES TO S3 BUCKET
// miscRouter.post("/upload/image/s3", miscController.uploadImageToS3);

module.exports = miscRouter;
