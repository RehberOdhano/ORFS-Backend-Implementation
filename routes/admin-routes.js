// IMPORTED THE REQUIRED PACKAGE(S)
const { express } = require("../utils/packages");

// ROUTER
const adminRouter = express.Router();

// CONTROLLERS
const adminController = require("../controllers/adminController");

/*
=============================================================================
|                                   ROUTES                                  |
=============================================================================
*/

// ADMIN USER ROUTES
adminRouter.get("/users/all/:id", adminController.getUsersList);
// adminRouter.get("/users/:id", adminController.getSpecificUser);
adminRouter.post("/users/add/:id", adminController.addSpecificUser);
adminRouter.post("/users/multiple/add/:id", adminController.addMultipleUsers);
adminRouter.put("/users/update/:id", adminController.updateSpecificUser);
adminRouter.put("/users/update/status/:id", adminController.updateUserStatus);
adminRouter.delete("/users/delete/:id", adminController.deleteSpecificUser);
adminRouter.get("/users/report/:id", adminController.generateUsersReport);
// adminRouter.delete(
//   "/users/deleteMultiple",
//   adminController.deleteMultipleUsers
// );

// ADMIN ROLES ROUTES
// adminRouter.get('/roles', adminController.getRolesList);
// // adminRouter.get('/role/:id', adminController.getSpecificRole);
// adminRouter.put('/role/update/:id', adminController.updateSpecificRole);
// adminRouter.delete('/role/delete/:id', adminController.deleteSpecificRole);
// adminRouter.delete('/role/delete/miultiple', adminController.deleteMultipleRole);

// ADMIN COMPLAINT ROUTES
adminRouter.get("/complaints/:id", adminController.getComplaintsList);
// adminRouter.get('/complaint/:id', adminController.getSpecificComplaint);
adminRouter.post("/assign/complaint/:id", adminController.assignComplaint);
adminRouter.put(
  "/complaints/update/:id",
  adminController.updateSpecificComplaint
);
adminRouter.put(
  "/complaints/archive/:id",
  adminController.archiveSpecificComplaint
);

// ADMIN DEPARTMENTS ROUTES
adminRouter.get("/depts/all/:id", adminController.getDeptsList);
adminRouter.get("/depts/:id", adminController.getSpecificDept);
adminRouter.post("/deptsAdd/:id", adminController.addSpecificDept);
adminRouter.put("/depts/update/:id", adminController.updateSpecificDept);
adminRouter.delete("/depts/delete/:id", adminController.deleteSpecificDept);
adminRouter.put("/depts/employee/add/:id", adminController.addEmployeesToDept);
adminRouter.get(
  "/depts/all/employees/:id",
  adminController.getAllDeptEmployees
);
adminRouter.put(
  "/depts/delete/employee/:id",
  adminController.removeEmployeesFromDept
);
adminRouter.get("/depts/unassigned/:id", adminController.getAvailableEmployees);
adminRouter.get("/depts/report/:id", adminController.generateDeptReport);

// ADMIN PAYMENT ROUTES
// adminRouter.get('/payment', adminController.getPaymentInfo);
// adminRouter.put('/payment/update', adminController.updatePaymentInfo);
// adminRouter.put('/payment/addons', adminController.addServices);
// adminRouter.post('/payment/rewards', adminController.addRewards);

// ADMIN CATEGORY ROUTES
adminRouter.get("/categories/all/:id", adminController.getAllCategories);
adminRouter.get(
  "/categories/unassigned/:id",
  adminController.getUnassignedCategories
);
adminRouter.post("/categories/add/:id", adminController.addCategory);
adminRouter.put("/categories/dept/add/:id", adminController.addCategoryToDept);
adminRouter.put(
  "/categories/dept/delete/:id",
  adminController.removeCategoryToDept
);
adminRouter.delete("/categories/delete/:id", adminController.deleteCategory);

// ADMIN IMPORT, EXPORT & DELETE CSV FILE ROUTES
adminRouter.post("/upload/csv", adminController.parseCSVFile);
adminRouter.delete(
  "/delete/csv/:csv_file",
  adminController.deleteUploadedCSVFile
);

// LEADERBOARD & GAMIFICATION RELATED ROUTES
// to get the average of ratings of all the serviceproviders within a specific department
adminRouter.get(
  "/all/serviceproviders/ratings/dept/:id",
  adminController.getAvgRatingOfSpsOfDept
);

// to get the average of ratings of all the serviceproviders within a company
adminRouter.get(
  "/all/serviceproviders/ratings/customer/:id",
  adminController.getAvgRatingOfSpsOfCustomer
);

// SUBSCRIPTION ROUTES
adminRouter.get(
  "/get/subscription/:id",
  adminController.getCurrentSubscription
);

// VIDEOSDK - AUDIO/VIDEO CHAT
// adminRouter.get("/get-token", adminController.getAccessToken);
// adminRouter.post("/create-meeting", adminController.createMeeting);
// adminRouter.post(
//   "/validate-meeting/:meetingId",
//   adminController.validateMeeting
// );

// ZOOM - AUDIO/VIDEO CHAT ROUTES
adminRouter.post("/create-meeting", adminController.createZoomMeeting);

// TWILIO - AUDIO/VIDEO CHAT ROUTES
// adminRouter.post("/create-meeting", adminController.createTwilioMeeting);

// KNOWLEDGEBASE ROUTES
adminRouter.post("/add/guide", adminController.getGuides);

// RECOMMENDER SYSTEM ROUTES
adminRouter.post("/get-recommendations", adminController.getRecomendations);

module.exports = adminRouter;
