const express = require("express");
const analytics_controller = express.Router();
const analyticsController = require("../controllers/analyticsController");

// ANALYTICS ROUTES
analytics_controller.get("/customers", analyticsController.getCustomerCount);
analytics_controller.get("/users", analyticsController.getUserCount);

module.exports = analytics_controller;
