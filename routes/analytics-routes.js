// IMPORTED REQUIRED PACKAGES
const { express } = require("../utils/packages");

// ROUTER
const analyticsRouter = express.Router();

// CONTROLLERS
const analyticsController = require("../controllers/analyticsController");

/*
=============================================================================
|                                   ROUTES                                  |
=============================================================================
*/

// ANALYTICS ROUTES
analyticsRouter.get("/customers", analyticsController.getCustomerCount);
analyticsRouter.get("/users", analyticsController.getUserCount);
analyticsRouter.get(
  "/admin-analytics/:id",
  analyticsController.getAdminDashboardAnalytics
);
analyticsRouter.get(
  "/department-analytics/:id",
  analyticsController.getDeptDashboardAnalytics
);
analyticsRouter.get(
  "/serviceprovider/dashboard/:id",
  analyticsController.getServiceProviderDashboardAnalytics
);

analyticsRouter.get(
  "/complaints/:id",
  analyticsController.getComplaintsAnalytics
);

module.exports = analyticsRouter;
