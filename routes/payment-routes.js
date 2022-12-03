// IMPORTED REQUIRED PACKAGES
const { express } = require("../utils/packages");

// ROUTER
const paymentRouter = express.Router();

// CONTROLLERS
const paymentController = require("../controllers/paymentController");

// PAYMENT USING STRIPE - TESTING
paymentRouter.post("/paymentIntent", paymentController.addPaymentIntent);
paymentRouter.post("/add/payment/:id", paymentController.addPayment);

module.exports = paymentRouter;
