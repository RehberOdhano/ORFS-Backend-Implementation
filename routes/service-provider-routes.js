// IMPORTED REQUIRED PACKAGES
const { express } = require("../utils/packages");

// ROUTER
const serviceProviderRouter = express.Router();

// CONTROLLERS
const serviceProviderController = require("../controllers/serviceProviderController");

/*
=============================================================================
|                                   ROUTES                                  |
=============================================================================
*/

serviceProviderRouter.get("/:id", serviceProviderController.getSpecificSP);
serviceProviderRouter.get(
  "/complaints/assigned/:id",
  serviceProviderController.getAssignedComplaints
);
serviceProviderRouter.put(
  "/complaints/update/:id",
  serviceProviderController.updateComplaint
);
serviceProviderRouter.put(
  "/complaints/resolve/:id",
  serviceProviderController.resolveComplaint
);
serviceProviderRouter.put(
  "/complaints/transfer/:id",
  serviceProviderController.transferComplaint
);

// LEADERBOARD & GAMIFICATION RELATED ROUTES
serviceProviderRouter.get(
  "/avg-rating/:id",
  serviceProviderController.getAvgRating
);

module.exports = serviceProviderRouter;
