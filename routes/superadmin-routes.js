// IMPORTED REQUIRED PACKAGES
const { express } = require("../utils/packages");

// ROUTER
const superAdminRouter = express.Router();

// CONTROLLERS
const superAdminController = require("../controllers/superadminController");

/*
=============================================================================
|                                   ROUTES                                  |
=============================================================================
*/

// SUPERADMIN CUSTOMER ROUTES
superAdminRouter.get("/customers", superAdminController.getAllCustomers);
superAdminRouter.post("/customers/add", superAdminController.addCustomer);
superAdminRouter.put(
  "/customers/update/:id",
  superAdminController.editCustomer
);
superAdminRouter.put(
  "/customers/update/status/:id",
  superAdminController.updateCustomerStatus
);
superAdminRouter.delete(
  "/customers/delete/:id",
  superAdminController.deleteCustomer
);

// SUPERADMIN ADMIN ROUTES
superAdminRouter.post("/admins/add/:id", superAdminController.addAdmin);
superAdminRouter.delete("/admins/delete/:id", superAdminController.deleteAdmin);

// SUPERADMIN CUSTOMER TYPE ROUTES
superAdminRouter.post(
  "/customerType/add",
  superAdminController.addCustomerType
);
superAdminRouter.get("/customerType", superAdminController.getCustomerTypes);

// EMAIL VERIFICATION ROUTE
superAdminRouter.get(
  "/admin/verify/:id/:email/:token",
  superAdminController.verifyEmail
);

module.exports = superAdminRouter;
