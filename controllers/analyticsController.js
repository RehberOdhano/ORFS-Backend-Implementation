// MODELS
const Customer = require("../models/customer");
const User = require("../models/user");
const SP = require("../models/serviceProvider");
const Complainee = require("../models/complainee");
const Department = require("../models/department");
const Complaint = require("../models/complaint");

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
exports.getAdminDashboardAnalytics = (req, res) => {
  try {
    const company_id = req.params.id;
    var analytics = {};
    User.count({
      company_id: company_id,
      role: { $in: ["COMPLAINEE", "SERVICEPROVIDER"] },
    }).exec((err, count) => {
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
          role: { $in: ["COMPLAINEE", "SERVICEPROVIDER"] },
          status: "ACTIVE",
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
            SP.count({ company_id: company_id }).exec((err, count) => {
              if (err) {
                res.send({
                  status: 500,
                  success: false,
                  message: err.message,
                });
              } else {
                analytics.numOfServiceProviders = count;
                Complainee.count({ company_id: company_id }).exec(
                  (err, count) => {
                    if (err) {
                      res.send({
                        status: 500,
                        success: false,
                        message: err.message,
                      });
                    } else {
                      analytics.numOfComplainees = count;
                      Complaint.count({ company_id: company_id }).exec(
                        (err, count) => {
                          if (err) {
                            res.send({
                              status: 500,
                              success: false,
                              message: err.message,
                            });
                          } else {
                            analytics.numOfComplaints = count;
                            res.send({
                              status: 200,
                              success: true,
                              data: analytics,
                            });
                          }
                        }
                      );
                    }
                  }
                );
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

exports.getDeptDashboardAnalytics = (req, res) => {
  try {
    const company_id = req.params.id;
    var analytics = {};
    Department.find({ company_id: company_id })
      .populate("employees")
      .exec((err, departments) => {
        if (err) {
          res.send({
            status: 500,
            success: false,
            message: err.message,
          });
        } else {
          var count = 0,
            totalRating = 0,
            numOfServiceProviders = 0,
            numOfDepartments = 0;

          // getting total number of departments, serviceproviders, and average
          // rating of all the service providers of all the departments...
          for (var dept of departments) {
            for (var employee of dept.employees) {
              employee.averageRating != null
                ? (totalRating += employee.averageRating)
                : (totalRating += 0);
              numOfServiceProviders++;
              count++;
            }
            numOfDepartments++;
          }

          analytics.numberOfDepartments = numOfDepartments;
          analytics.numberOfServiceProviders = numOfServiceProviders;
          analytics.averageRating = count !== 0 ? totalRating / count : 0;
          console.log(analytics);
          res.send({
            status: 200,
            success: true,
            data: analytics,
          });
        }
      });
  } catch (err) {
    console.log("ERROR: " + err.message);
  }
};
