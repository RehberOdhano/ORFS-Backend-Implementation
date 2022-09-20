const express = require("express");
const passport = require("passport");
const auth_router = express.Router();
const authController = require("../controllers/authController");

// USER LOGIN ROUTES
auth_router.post("/login", authController.login);

// USER REGISTER ROUTES
auth_router.post("/register", authController.register);

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
