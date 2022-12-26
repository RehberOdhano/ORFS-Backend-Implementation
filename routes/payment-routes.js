// IMPORTED REQUIRED PACKAGES
const { express } = require("../utils/packages");

// ROUTER
const paymentRouter = express.Router();

// CONTROLLERS
const paymentController = require("../controllers/paymentController");

// PAYMENT USING STRIPE - TESTING
paymentRouter.post("/initiate/payment/:id", paymentController.initiatePayment);
paymentRouter.post("/paymentIntent", paymentController.addPaymentIntent);
paymentRouter.put("/confirm/payment/:id", paymentController.confirmPayment);

module.exports = paymentRouter;