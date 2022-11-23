// IMPORTED THE REQUIRED PACKAGE(S)
const { express } = require("../utils/packages");

// ROUTER
const admin_router = express.Router();

// CONTROLLERS
const adminController = require("../controllers/adminController");

/*
=============================================================================
|                                   ROUTES                                  |
=============================================================================
*/

// ADMIN USER ROUTES
admin_router.get("/users/all/:id", adminController.getUsersList);
// admin_router.get("/users/:id", adminController.getSpecificUser);
admin_router.post("/users/add/:id", adminController.addSpecificUser);
admin_router.put("/users/update/:id", adminController.updateSpecificUser);
admin_router.put("/users/update/status/:id", adminController.updateUserStatus);
admin_router.delete("/users/delete/:id", adminController.deleteSpecificUser);
admin_router.get("/users/report/:id", adminController.generateUsersReport);
// admin_router.delete(
//   "/users/deleteMultiple",
//   adminController.deleteMultipleUsers
// );

// ADMIN ROLES ROUTES
// admin_router.get('/roles', adminController.getRolesList);
// // admin_router.get('/role/:id', adminController.getSpecificRole);
// admin_router.put('/role/update/:id', adminController.updateSpecificRole);
// admin_router.delete('/role/delete/:id', adminController.deleteSpecificRole);
// admin_router.delete('/role/delete/miultiple', adminController.deleteMultipleRole);

// ADMIN COMPLAINT ROUTES
admin_router.get("/complaints/:id", adminController.getComplaintsList);
// admin_router.get('/complaint/:id', adminController.getSpecificComplaint);
admin_router.post("/assign/complaint/:id", adminController.assignComplaint);
admin_router.put(
  "/complaints/update/:id",
  adminController.updateSpecificComplaint
);
admin_router.put(
  "/complaints/archive/:id",
  adminController.archiveSpecificComplaint
);

// ADMIN DEPARTMENTS ROUTES
admin_router.get("/depts/all/:id", adminController.getDeptsList);
admin_router.get("/depts/:id", adminController.getSpecificDept);
admin_router.post("/deptsAdd/:id", adminController.addSpecificDept);
admin_router.put("/depts/update/:id", adminController.updateSpecificDept);
admin_router.delete("/depts/delete/:id", adminController.deleteSpecificDept);
admin_router.put("/depts/employee/add/:id", adminController.addEmployeesToDept);
admin_router.get(
  "/depts/all/employees/:id",
  adminController.getAllDeptEmployees
);
admin_router.put(
  "/depts/delete/employee/:id",
  adminController.removeEmployeesFromDept
);
admin_router.get(
  "/depts/unassigned/:id",
  adminController.getAvailableEmployees
);
admin_router.get("/depts/report/:id", adminController.generateDeptReport);

// ADMIN PAYMENT ROUTES
// admin_router.get('/payment', adminController.getPaymentInfo);
// admin_router.put('/payment/update', adminController.updatePaymentInfo);
// admin_router.put('/payment/addons', adminController.addServices);
// admin_router.post('/payment/rewards', adminController.addRewards);

// ADMIN CATEGORY ROUTES
admin_router.get("/categories/all/:id", adminController.getAllCategories);
admin_router.get(
  "/categories/unassigned/:id",
  adminController.getUnassignedCategories
);
admin_router.post("/categories/add/:id", adminController.addCategory);
admin_router.put("/categories/dept/add/:id", adminController.addCategoryToDept);
admin_router.delete("/categories/delete/:id", adminController.deleteCategory);

// ADMIN IMPORT, EXPORT & DELETE CSV FILE ROUTES
admin_router.post("/upload/csv", adminController.parseCSVFile);
admin_router.delete(
  "/delete/csv/:csv_file",
  adminController.deleteUploadedCSVFile
);

module.exports = admin_router;
