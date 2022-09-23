// IMPORTED THE REQUIRED PACKAGES
const express = require("express");
const admin_router = express.Router();
const path = require("path");
const multer = require("multer");

// CONTROLLERS
const adminController = require("../controllers/adminController");

// HELPER FUNCTIONS FOR IMPORTING & EXPORTING CSV FILES
const fileStorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/csv-files");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + file.originalname);
  },
});

const upload = multer({
  storage: fileStorageEngine,
  limits: { fileSize: 1024 * 1024 * 5 },
  fileFilter: (req, file, cb) => {
    var ext = path.extname(file.originalname);
    if (file.size > limits.fileSize) {
      return cb(new Error("FILES SIZE SHOULD NOT BE MORE THAN 5MBs!"));
    } else {
      if (ext !== ".csv") {
        return cb(new Error("ONLY CSV FILES ARE ALLOWED!"));
      } else {
        cb(null, true);
      }
    }
  },
});

// ADMIN USER ROUTES
admin_router.get("/users/all/:id", adminController.getUsersList);
// admin_router.get('/users/:id', adminController.getSpecificUser);
admin_router.post("/users/add/:id", adminController.addSpecificUser);
admin_router.put("/users/update/:id", adminController.updateSpecificUser);
admin_router.delete("/users/delete/:id", adminController.deleteSpecificUser);
admin_router.delete(
  "/users/deleteMultiple",
  adminController.deleteMultipleUsers
);

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
admin_router.delete(
  "/complaints/delete/:id",
  adminController.deleteSpecificComplaint
);

// ADMIN DEPARTMENTS ROUTES
admin_router.get("/depts/all/:id", adminController.getDeptsList);
admin_router.get("/depts/:id", adminController.getSpecificDept);
admin_router.post("/deptsAdd/:id", adminController.addSpecificDept);
admin_router.put("/depts/update/:id", adminController.updateSpecificDept);
admin_router.delete("/depts/delete/:id", adminController.deleteSpecificDept);
admin_router.put("/depts/employee/add/:id", adminController.addDeptEmployee);
admin_router.get(
  "/depts/all/employees/:id",
  adminController.getAllDeptEmployees
);
admin_router.delete(
  "/depts/delete/employee/:id",
  adminController.deleteDeptEmployee
);
admin_router.get(
  "/depts/unassigned/:id",
  adminController.getAvailableEmployees
);

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
admin_router.post(
  "/upload/csv",
  upload.single("csv_file"),
  adminController.parseCSVFile
);

admin_router.post(
  "/upload/csv",
  upload.single("csv_file"),
  adminController.parseCSVFile
);

admin_router.delete(
  "/delete/csv/:csv_file",
  adminController.deleteUploadedCSVFile
);

module.exports = admin_router;
