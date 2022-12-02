// IMPORTED REQUIRED PACKAGES
const { express } = require("../utils/packages");

// ROUTER
const authRouter = express.Router();

// CONTROLLERS
const authController = require("../controllers/authController");

/*
=============================================================================
|                                   ROUTES                                  |
=============================================================================
*/

// USER LOGIN ROUTES
authRouter.post("/login", authController.login);

// USER REGISTER ROUTES
authRouter.post("/register", authController.register);

// TEST DEPLOY ROUTES
// authRouter.get("/", (req, res) => {
//   res.send("THIS IS WORKING");
// });

// authRouter.post('/extra', authController.extra);

// GOOGLE AUTH ROUTES
authRouter.post("/auth/google", authController.googleSignIn);

module.exports = authRouter;
