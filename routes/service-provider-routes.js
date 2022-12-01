// IMPORTED REQUIRED PACKAGES
const { express } = require("../utils/packages");

// ROUTER
const service_provider_router = express.Router();

// CONTROLLERS
const serviceProviderController = require("../controllers/serviceProviderController");

/*
=============================================================================
|                                   ROUTES                                  |
=============================================================================
*/

service_provider_router.get("/:id", serviceProviderController.getSpecificSP);
service_provider_router.get(
  "/complaints/assigned/:id",
  serviceProviderController.getAssignedComplaints
);
service_provider_router.put(
  "/complaints/update/:id",
  serviceProviderController.updateComplaint
);
service_provider_router.put(
  "/complaints/resolve/:id",
  serviceProviderController.resolveComplaint
);
service_provider_router.put(
  "/complaints/transfer/:id",
  serviceProviderController.transferComplaint
);

// LEADERBOARD & GAMIFICATION RELATED ROUTES
service_provider_router.get(
  "/avg-rating/:id",
  serviceProviderController.getAvgRating
);

module.exports = service_provider_router;
