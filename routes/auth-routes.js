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

//GOOGLE AUTH ROUTES
// auth_router.get(
//   "/auth/google",
//   passport.authenticate("google", { scope: ["profile"] })
// );

// auth_router.get(
//   "/auth/google/callback",
//   passport.authenticate("google", { failureRedirect: "/login" }),
//   (req, res) => {
//     res.send({
//       status: 404,
//       success: false,
//       message: "UNABLE TO SIGN IN USING GOOGLE!",
//     });
//   }
// );

module.exports = auth_router;
