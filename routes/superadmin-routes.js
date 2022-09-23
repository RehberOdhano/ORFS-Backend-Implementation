const express = require("express");
const superadmin_router = express.Router();
const superadminController = require("../controllers/superadminController");

// SUPERADMIN CUSTOMER ROUTES
superadmin_router.get("/customers", superadminController.getAllCustomers);
superadmin_router.post("/customers/add", superadminController.addCustomer);
superadmin_router.put(
  "/customers/update/:id",
  superadminController.editCustomer
);
superadmin_router.delete(
  "/customers/delete/:id",
  superadminController.deleteCustomer
);

// SUPERADMIN ADMIN ROUTES
superadmin_router.post("/admins/add/:id", superadminController.addAdmin);
superadmin_router.delete(
  "/admins/delete/:id",
  superadminController.deleteAdmin
);

// SUPERADMIN CUSTOMER TYPE ROUTES
superadmin_router.post(
  "/customerType/add",
  superadminController.addCustomerType
);
superadmin_router.get("/customerType", superadminController.getCustomerTypes);

// EMAIL VERIFICATION ROUTE
superadmin_router.get(
  "/admin/verify/:id/:token",
  superadminController.verifyEmail
);

module.exports = superadmin_router;
