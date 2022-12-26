// IMPORTED REQUIRED PACKAGES
const { express } = require("../utils/packages");

// ROUTER
const paymentRouter = express.Router();

// CONTROLLERS
const paymentController = require("../controllers/paymentController");

// PAYMENT USING STRIPE - TESTING
paymentRouter.post("/initiate/payement:id", paymentController.initiatePayment);
paymentRouter.post("/paymentIntent", paymentController.addPaymentIntent);

module.exports = paymentRouter;