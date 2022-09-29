// IMPORTED REQUIRED PACKAGES
const { express } = require("../utils/packages");

// ROUTER
const superadmin_router = express.Router();

// CONTROLLERS
const superadminController = require("../controllers/superadminController");

/*
=============================================================================
|                                   ROUTES                                  |
=============================================================================
*/

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
  "/admin/verify/:id/:email/:token",
  superadminController.verifyEmail
);

module.exports = superadmin_router;
