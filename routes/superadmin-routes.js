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

module.exports = superadmin_router;
