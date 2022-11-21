// IMPORTED REQUIRED PACKAGES
const { express } = require("../utils/packages");

// ROUTER
const auth_router = express.Router();

// CONTROLLERS
const authController = require("../controllers/authController");

/*
=============================================================================
|                                   ROUTES                                  |
=============================================================================
*/

// USER LOGIN ROUTES
auth_router.post("/login", authController.login);

// USER REGISTER ROUTES
auth_router.post("/register", authController.register);

// TEST DEPLOY ROUTES
// auth_router.get("/", (req, res) => {
//   res.send("THIS IS WORKING");
// });

// auth_router.post('/extra', authController.extra);

// GOOGLE AUTH ROUTES
auth_router.post("/auth/google", authController.googleSignIn);

module.exports = auth_router;
