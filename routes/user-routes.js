// IMPORTED REQUIRED PACKAGES
const { express } = require("../utils/packages");

// ROUTER
const user_router = express.Router();

// CONTROLLERS
const userController = require("../controllers/userController");

/*
=============================================================================
|                                   ROUTES                                  |
=============================================================================
*/

// USERS COMPLAINT ROUTES
user_router.get("/complaints/:id", userController.getAllComplaints);
user_router.post(
  "/complaints/file/complaint/:id",
  userController.fileNewComplaint
);
user_router.post("/complaints/rating/submit/:id", userController.submitRating);
// user_router.delete("/complaints/delete/:id", userController.deleteComplaint);
// user_router.put("/complaints/update/:id", userController.updateComplaint);
// user_router.put(
//   "/complaints/archive/:id",
//   userController.archiveSpecificComplaint
// );
// user_router.get(
//   "/get/archive/complaints/:id",
//   userController.getArchivedComplaints
// );

module.exports = user_router;
