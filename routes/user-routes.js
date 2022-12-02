// IMPORTED REQUIRED PACKAGES
const { express } = require("../utils/packages");

// ROUTER
const userRouter = express.Router();

// CONTROLLERS
const userController = require("../controllers/userController");

/*
=============================================================================
|                                   ROUTES                                  |
=============================================================================
*/

// USERS COMPLAINT ROUTES
userRouter.get("/complaints/:id", userController.getAllComplaints);
userRouter.post(
  "/complaints/file/complaint/:id",
  userController.fileNewComplaint
);
userRouter.post("/complaints/rating/submit/:id", userController.submitRating);
// userRouter.delete("/complaints/delete/:id", userController.deleteComplaint);
// userRouter.put("/complaints/update/:id", userController.updateComplaint);
// userRouter.put(
//   "/complaints/archive/:id",
//   userController.archiveSpecificComplaint
// );
// userRouter.get(
//   "/get/archive/complaints/:id",
//   userController.getArchivedComplaints
// );

module.exports = userRouter;
