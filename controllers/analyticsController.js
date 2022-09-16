// MODELS
const Customer = require("../models/customer");
const User = require("../models/user");

exports.getCustomerCount = (req, res) => {
  try {
    Customer.count({}, (err, count) => {
      if (err) {
        res.send({
          status: 404,
          success: false,
          message: err.message,
        });
      } else {
        res.send({
          status: 200,
          success: true,
          count: count,
        });
      }
    });
  } catch (error) {
    console.log("ERROR: " + error.message);
  }
};

exports.getUserCount = (req, res) => {
  try {
    User.count({}, (err, count) => {
      if (err) {
        res.send({
          status: 404,
          success: false,
          message: err.message,
        });
      } else {
        res.send({
          status: 200,
          success: true,
          count: count,
        });
      }
    });
  } catch (error) {
    console.log("ERROR: " + error.message);
  }
};
