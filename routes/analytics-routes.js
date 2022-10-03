// IMPORTED REQUIRED PACKAGES
const { express } = require("../utils/packages");

// ROUTER
const analytics_controller = express.Router();

// CONTROLLERS
const analyticsController = require("../controllers/analyticsController");

/*
=============================================================================
|                                   ROUTES                                  |
=============================================================================
*/

// ANALYTICS ROUTES
analytics_controller.get("/customers", analyticsController.getCustomerCount);
analytics_controller.get("/users", analyticsController.getUserCount);
analytics_controller.get(
  "/user-analytics/:id",
  analyticsController.getUserAnalytics
);

module.exports = analytics_controller;
