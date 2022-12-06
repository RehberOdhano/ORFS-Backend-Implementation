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

          const averageRating = count !== 0 ? (totalRating / count) * 100 : 0;
          const analytics = {
            numberOfDepartments: numOfDepartments,
            numberOfServiceProviders: numOfServiceProviders,
            deptSuccessRate: {
              text: `${averageRating}%`,
              value: averageRating,
            },
          };

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

// serviceprovider dashboard analytics
exports.getServiceProviderDashboardAnalytics = (req, res) => {
  try {
    const spUserId = req.params.id;
    SP.findOne({ userId: spUserId })
      .populate("assignedComplaints")
      .exec((err, data) => {
        if (err) {
          res.status(500).send({ message: err.message });
        } else {
          let resolvedComplaints = 0;
          data.assignedComplaints.forEach((complaint) => {
            if (complaint.status === "RESOLVED") resolvedComplaints++;
          });
          const successRate =
            data.assignedComplaints.length > 0
              ? (resolvedComplaints / data.assignedComplaints.length) * 100
              : 0;
          const analyticsObj = {
            successStatus: {
              text: `${successRate}%`,
              value: successRate,
            },
            totalComplaints: data.assignedComplaints.length,
            resolvedComplaints: resolvedComplaints,
            unresolvedComplaints:
              data.assignedComplaints.length - resolvedComplaints,
            level: data.level,
            points: data.points,
            averageRating: data.averageRating,
          };
          res.status(200).send(analyticsObj);
        }
      });
  } catch (error) {
    console.log("ERROR: " + error.message);
    res.status(500).send({ message: error.message });
  }
};

exports.getComplaintsAnalytics = (req, res) => {
  try {
    Complaint.find({ company_id: req.params.id })
      // .lean()
      // .populate([
      //   "category",
      //   "rating",
      //   {
      //     path: "assignedTo",
      //     populate: {
      //       path: "user_id",
      //       model: "User",
      //     },
      //   },
      //   {
      //     path: "complainee_id",
      //     model: "User",
      //     select: ["name", "email", "pfp"],
      //   },
      // ])
      .exec((err, complaints) => {
        if (err) {
          res.status(500).send({ message: err.message });
        } else {
          let resolvedComplaints = 0,
            unAssignedComplaints = 0;
          complaints.forEach((complaint) => {
            if (complaint.status === "RESOLVED") resolvedComplaints++;
            if (complaint.status === "UNASSIGNED") unAssignedComplaints++;
          });

          const resolvedPercentage =
            complaints.length > 0
              ? (resolvedComplaints / complaints.length) * 100
              : 0;
          const analytics = {
            resolvedComplaintsStatus: {
              text: `${resolvedPercentage}%`,
              value: resolvedPercentage,
            },
            totalComplaints: complaints.length,
            unResolvedComplaints: complaints.length - resolvedComplaints,
            resolvedComplaints: resolvedComplaints,
            unAssignedComplaints: unAssignedComplaints,
          };
          res.status(200).send(analytics);
        }
      });
  } catch (err) {
    console.error("ERROR: " + err.message);
    res.status(500).send({ message: err.message });
  }
};
