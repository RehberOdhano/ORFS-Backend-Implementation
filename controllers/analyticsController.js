// MODELS
const Customer = require("../models/customer");
const User = require("../models/user");
const SP = require("../models/serviceProvider");
const Complainee = require("../models/complainee");

/*
=============================================================================
|                             ANALYTICS ROUTES                              |
=============================================================================
*/
exports.getCustomerCount = (req, res) => {
  try {
    Customer.count({}, (err, count) => {
      if (err) {
        res.send({
          status: 500,
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
          status: 500,
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

// this'll return percentage of registered users, count of serviceproviders
// and complainees respectively...
exports.getUserAnalytics = (req, res) => {
  try {
    const company_id = req.params.id;
    var analytics = {};
    User.count({ company_id: company_id }, (err, count) => {
      if (err) {
        res.send({
          status: 500,
          success: false,
          message: err.message,
        });
      } else {
        const totalUsers = count;
        User.count({
          company_id: company_id,
          status: { $ne: "UNREGISTERED" },
        }).exec((err, count) => {
          if (err) {
            res.send({
              status: 500,
              success: false,
              message: err.message,
            });
          } else {
            analytics.registeredUsers =
              totalUsers != 0 ? Math.round((count / totalUsers) * 100) : 0;
            SP.count({ company_id: company_id }, (err, count) => {
              if (err) {
                res.send({
                  status: 500,
                  success: false,
                  message: err.message,
                });
              } else {
                analytics.serviceproviders = count;
                Complainee.count({ company_id: company_id }, (err, count) => {
                  if (err) {
                    res.send({
                      status: 500,
                      success: false,
                      message: err.message,
                    });
                  } else {
                    analytics.complainees = count;
                    res.send({
                      status: 200,
                      success: true,
                      data: analytics,
                    });
                  }
                });
              }
            });
          }
        });
      }
    });
  } catch (error) {
    console.log("ERROR: " + error.message);
  }
};
