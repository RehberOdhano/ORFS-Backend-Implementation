// IMPORTED REQUIRED PACKAGES
const { express } = require("../utils/packages");

// ROUTER
const paymentRouter = express.Router();

// CONTROLLERS
const paymentController = require("../controllers/paymentController");

// PAYMENT USING STRIPE - TESTING
paymentRouter.post("/add/payment", paymentController.addPayment);

module.exports = paymentRouter;
