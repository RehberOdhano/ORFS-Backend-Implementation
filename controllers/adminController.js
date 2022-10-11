// IMPORTED REQUIRED PACKAGES
const {
  bcrypt,
  mongoose,
  csv,
  path,
  fs,
  multer,
} = require("../utils/packages");

// UTILITY/HELPER FUNCTIONS
const sendEmail = require("../utils/email");

const fileSize = 1024 * 1024 * 5;

const fileStorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/csv-files");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + file.originalname);
  },
});

const upload = multer({
  storage: fileStorageEngine,
  limits: { fileSize: fileSize },
  fileFilter: (req, file, cb) => {
    var ext = path.extname(file.originalname);
    if (file.size > fileSize) {
      return cb(new Error("FILE SIZE SHOULD NOT BE MORE THAN 5MBs!"));
    } else {
      if (ext !== ".csv") {
        return cb(new Error("ONLY CSV FILES ARE ALLOWED!"));
      } else {
        return cb(null, true);
      }
    }
  },
}).single("csv_file");

// MODELS
const User = require("../models/user");
const Complaint = require("../models/complaint");
const Category = require("../models/category");
const Customer = require("../models/customer");
const Department = require("../models/department");
const Complainee = require("../models/complainee");
const SP = require("../models/serviceProvider");

/*
=============================================================================
|                         ADMINS' USERS' ROUTES                             |
=============================================================================
*/

exports.getUsersList = (req, res) => {
  try {
    const company_id = req.params.id;
    User.find({
      company_id: company_id,
      role: { $in: ["COMPLAINEE", "SERVICEPROVIDER"] },
    })
      .populate("company_id")
      .exec((err, users) => {
        if (err) {
          res.send({
            status: 500,
            success: false,
            message: err.message,
          });
        } else if (users == null) {
          res.send({
            status: 200,
            success: true,
            message: "USERS DOES NOT EXIST!",
          });
        } else {
          res.send({
            status: 200,
            success: true,
            data: users,
          });
        }
      });
  } catch (err) {
    console.log("ERROR: " + err.message);
  }
};

// exports.getSpecificUser = async (req, res) => {
//   const user_id = req.params.id;
//   await User.findOne({ id: user_id }, (err, user) => {
//     if (err) {
//       res.send({
//         status: 500,
//         success: false,
//         message: err.message,
//       });
//     } else {
//       res.send({
//         status: 200,
//         success: true,
//         user: user,
//       });
//     }
//   });
// };

// this will add a new user... and based on it's role, i.e. either the user
// is complainee or serviceprovider, a new document will also be created in that
// particular collection...

// SP/complainee not added to the customer's employees list... check later
exports.addSpecificUser = (req, res) => {
  try {
    const email = req.body.email;
    const role = req.body.role;
    User.findOne({ email: email }).exec((err, user) => {
      if (err) {
        res.send({
          status: 500,
          success: false,
          message: err.message,
        });
      } else if (user) {
        res.send({
          status: 200,
          success: true,
          message: "USER WITH THIS EMAIL ALREADY EXISTS!",
          user: user,
        });
      } else {
        const query = { email: req.body.email },
          update = {
            name: "N/A",
            email: email,
            role: role,
            sign_type: "PLATFORM",
            status: "UNREGISTERED",
            company_id: req.params.id,
          },
          options = { new: true, upsert: true };
        User.findOneAndUpdate(query, update, options).exec(
          (err, updatedUser) => {
            if (err) {
              res.send({
                status: 500,
                success: false,
                message: err.message,
              });
            } else {
              const userID = updatedUser._id;
              Customer.updateOne(
                { _id: updatedUser.company_id },
                { $push: { employees: { _id: userID } } }
              ).exec((err, user) => {
                if (err) {
                  res.send({
                    status: 500,
                    success: false,
                    message: err.message,
                  });
                } else {
                  if (role === "COMPLAINEE") {
                    Complainee.create(
                      {
                        user_id: userID,
                        company_id: req.params.id,
                      },
                      async (err, user) => {
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
                            message: `An email is sent to the ${role}... Please register here...`,
                            user: user,
                          });
                          const message = `Click this link to register: ${process.env.FRONTEND}/register`;
                          await sendEmail(
                            req.body.email,
                            "User Registration",
                            message
                          );
                        }
                      }
                    );
                  } else if (role === "SERVICEPROVIDER") {
                    SP.create(
                      {
                        user_id: userID,
                        company_id: req.params.id,
                        averageRating: 0,
                      },
                      async (err, user) => {
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
                            message: `An email is sent to the ${role}... Please register here...`,
                            user: user,
                          });
                          const message = `Click this link to register: ${process.env.FRONTEND}/register`;
                          await sendEmail(
                            req.body.email,
                            "User Registration",
                            message
                          );
                        }
                      }
                    );
                  }
                }
              });
            }
          }
        );
      }
    });
  } catch (err) {
    console.log("ERROR: " + err.message);
    return;
  }
};

// exports.updateUserStatus = (req, res) => {
//   try {
//     const userID = req.params.id;
//     const status = req.body.status;
//     User.updateOne(
//       { _id: userID, role: { $in: ["COMPLAINEE", "SERVICEPROVIDER"] } },
//       { status: status }
//     ).exec((err, updatedUser) => {
//       if (err) {
//         res.send({
//           status: 500,
//           success: false,
//           message: err.message,
//         });
//       } else {
//         console.log(updatedUser);
//         res.send({
//           status: 200,
//           success: true,
//           message: "USER'S STATUS IS SUCCESSFULLY UPDATED!",
//         });
//       }
//     });
//   } catch (err) {
//     console.log("ERROR: " + err.message);
//   }
// };

// this will update an specific user...
exports.updateSpecificUser = (req, res) => {
  try {
    const id = req.params.id;
    const name = req.body.name;
    const email = req.body.email;
    const status = req.body.status;
    User.findByIdAndUpdate(id, {
      name: name,
      email: email,
      status: status,
    }).exec((err, user) => {
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
          message: "USER IS SUCCESSFULLY UPDATED!",
        });
      }
    });
  } catch (err) {
    console.log("ERROR: " + err);
  }
};

// this will delete a user's record from the collection and based on the role,
// i.e. if the user is complainee, then a record from the complainee's collection
// and the related data will also be deleted and same for the role = serviceprovider...
// and after that, the user will also be removed from the company's employees list...
exports.deleteSpecificUser = (req, res) => {
  try {
    const userID = req.params.id;
    console.log(userID);
    User.findByIdAndDelete({ _id: userID }, function (err, user) {
      if (err) {
        res.send({
          status: 500,
          success: false,
          message: err.message,
        });
      } else {
        console.log(user);
        const company_id = user.company_id;
        if (user.role === "COMPLAINEE") {
          Complainee.findOne({ user_id: user._id })
            .populate("complaints")
            .exec((err, complaints) => {
              if (err) {
                res.send({
                  status: 500,
                  success: false,
                  message: err.message,
                });
              } else {
                console.log(complaints);
                Complainee.deleteOne({ user_id: user._id }).exec(
                  (err, response) => {
                    if (err) {
                      res.send({
                        status: 500,
                        success: false,
                        message: err.message,
                      });
                    } else {
                      Customer.updateOne(
                        { _id: company_id },
                        { $pull: { employees: userID } }
                      ).exec((err, updatedCustomer) => {
                        if (err) {
                          res.send({
                            status: 500,
                            success: false,
                            message: err.message,
                          });
                        } else {
                          Complaint.deleteMany({ _id: { $in: complaints } })
                            .populate("assignedTo")
                            .exec((err, serviceproviders) => {
                              if (err) {
                                res.send({
                                  status: 500,
                                  success: false,
                                  message: err.message,
                                });
                              } else {
                                console.log(serviceproviders);
                                SP.updateMany(
                                  { user_id: { $in: { serviceproviders } } },
                                  {
                                    $pull: {
                                      assignComplaints: { $in: complaints },
                                    },
                                  }
                                ).exec((err, result) => {
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
                                      message: "USER IS SUCCESSFULLY DELETED!",
                                    });
                                  }
                                });
                              }
                            });
                        }
                      });
                    }
                  }
                );
              }
            });
        } else {
          SP.deleteOne({ user_id: userID }).exec((err, result) => {
            Complaint.updateMany(
              { assignedTo: userID },
              { assignedTo: null }
            ).exec((err, updatedComplaints) => {
              if (err) {
                res.send({
                  status: 500,
                  success: false,
                  message: err.message,
                });
              } else {
                Customer.updateOne(
                  { _id: company_id },
                  { $pull: { employees: userID } }
                ).exec((err, updatedCustomer) => {
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
                      message: "SERVICEPROVIDER IS SUCCESSFULLY DELETED!",
                    });
                  }
                });
              }
            });
          });
        }
      }
    });
  } catch (err) {
    console.log("ERROR: " + err.message);
  }
};

exports.deleteMultipleUsers = (req, res) => {
  try {
    const company_id = mongoose.Types.ObjectId(req.params.company_id);
    const user_ids = req.body.ids.map((id) => mongoose.Types.ObjectId(id));
    const role = req.body.role;
    var error = false;
    User.deleteMany({ _id: { $in: user_ids } }).exec((err, users) => {
      if (err) {
        error = true;
      } else {
        if (role == "COMPLAINEE") {
          Complainee.deleteMany({ _id: { $in: user_ids } }).exec(
            (err, complainees) => {
              if (err) {
                error = true;
              }
            }
          );
        } else if (role == "SERVICEPROVIDER") {
          SP.deleteMany({ user_id: { $in: user_ids } }).exec((err, sps) => {
            if (err) {
              error = true;
            }
          });
        }
      }
      if (!error) {
        Customer.findByIdAndUpdate(
          { _id: company_id },
          { $pull: { employees: { _id: { $in: user_ids } } } }
        ).exec((err, users) => {
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
              message: "USERS ARE SUCCESSFULLY DELETED!",
            });
          }
        });
      } else {
        res.send({
          status: 500,
          success: false,
          message: "NOT ABLE TO DELETE THE USERS!",
        });
      }
    });
  } catch (err) {
    console.log("ERROR: " + err.message);
  }
};

// exports.getRolesList = async(req, res) => {
//     try {
//         await Role.find({}, (err, roles) => {
//             if (err) res.send("OOPS... NO DATA IN THE DATABASE!");
//             else {
//                 res.send(roles);
//             }
//         });
//     } catch (err) {
//         console.log(err);
//     }
// }

// exports.getSpecificRole = async(req, res) => {
//     const _id = req.query.id;
//     await Role.findOne({ id: _id }, (err, role) => {
//         if (err) res.send("OOPS... NO DATA IN THE DATABASE!");
//         else res.send(role);
//     });
// }

// exports.updateSpecificRole = async(req, res) => {
//     const id = req.params.id;
//     await Role.findByIdAndUpdate(id, {}, (err, role) => {
//         if (role) res.send("NOT ABLE TO UPDATE THE ROLE!");
//         else res.send("ROLE IS SUCCESSFULLY UPDATED!");
//     });
// }

// exports.deleteSpecificRole = async(req, res) => {
//     const role_id = req.params.id;
//     await Role.findByIdAndDelete(role_id, (err, role) => {
//         if (err) res.send("NOT ABLE TO DELETE THE ROLE!");
//         else res.send("ROLE IS SUCCESSFULLY DELETED!");
//     });
// }

// exports.deleteMultipleRole = (req, res) => {
//     const role_ids = req.body.ids;
//     role_ids.forEach(id => {
//         Role.findByIdAndDelete(id, (err, role) => {
//             if (err) res.send("NOT ABLE TO DELETE THE ROLE WITH ID: " + id);
//         });
//         res.send("SUCCESSFULLY DELETED ALL THE MENTIONED ROLES!");
//     });
// }

/*
=============================================================================
|                         ADMINS' COMPLAINTS ROUTES                         |
=============================================================================
*/

exports.getComplaintsList = (req, res) => {
  try {
    const company_id = req.params.id;
    Complaint.find({ company_id: company_id }).exec((err, complaints) => {
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
          complaints: complaints,
        });
      }
    });
  } catch (err) {
    console.log("ERROR: " + err.message);
  }
};

// exports.getSpecificComplaint = async(req, res) => {
//     try {
//         const _id = req.params.id;
//         await Complaint.findOne({ id: _id }, (err, complaint) => {
//             if (err) res.send("OOPS... NO DATA IN THE DATABASE!");
//             else res.send(complaint);
//         });
//     } catch (err) {
//         console.log(err);
//     }
// }

exports.updateSpecificComplaint = (req, res) => {
  try {
    const id = req.params.id;
    Complaint.findById(id).exec((err, complaint) => {
      if (err) {
        res.send({
          status: 500,
          success: false,
          message: err.message,
        });
      } else {
        const workUpdate =
          req.body.workUpdate == ""
            ? complaint.workUpdate
            : req.body.workUpdate;
        const status =
          req.body.status == "" ? complaint.status : req.body.status;
        Complaint.updateOne(id, {
          workUpdate: workUpdate,
          status: status,
        }).exec((err, complaint) => {
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
              message: "COMPLAINT IS SUCCESSFULLY UPDATED!",
            });
          }
        });
      }
    });
  } catch (err) {
    console.log("ERROR:" + err.message);
  }
};

exports.archiveSpecificComplaint = (req, res) => {
  try {
    const id = req.params.id;
    Complaint.updateOne(id, { status: "ARCHIVED" }).exec((err, complaint) => {
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
          message: "COMPLAINT IS SUCCESSFULLY ARCHIVED!",
        });
      }
    });
  } catch (err) {
    console.log("ERROR: " + err.message);
  }
};

exports.assignComplaint = (req, res) => {
  try {
    const complaintID = req.params.id;
    const spID = req.body.id;
    Complaint.updateOne(
      { _id: complaintID },
      {
        $push: {
          assignedTo: { _id: spID },
        },
      }
    ).exec((err, complaint) => {
      if (err) {
        res.send({
          status: 500,
          success: false,
          message: err.message,
        });
      } else {
        SP.updateOne(
          { _id: spID },
          {
            $push: {
              assignedComplaints: { _id: complaintID },
            },
          }
        ).exec((err, result) => {
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
              message: "COMPLAINT IS SUCCESSFULLY ASSIGNED!",
            });
          }
        });
      }
    });
  } catch (err) {
    console.log("ERROR:" + err.message);
  }
};

/*
=============================================================================
|                         ADMINS' DEPARTMENT ROUTES                         |
=============================================================================
*/

exports.getDeptsList = (req, res) => {
  try {
    Department.find({ company_id: req.params.id })
      .populate("employees")
      .populate("category")
      .exec((err, depts) => {
        if (err) {
          res.send({
            status: 500,
            success: false,
            message: err.message,
          });
        } else if (depts == null) {
          res.send({
            status: 200,
            success: true,
            message: "DEPARTMENTS NOT FOUND",
          });
        } else {
          var deptAnalytics = [];
          depts.forEach((dept) => {
            var tempObj = {};
            var totalComplaints = 0,
              resolvedComplaints = 0,
              unresolvedComplaints = 0;

            // for each dept, we select it's employees property, which is an array,
            // and for each employee in that array, we select it's assignedComplaints
            // property, which is also an array, and based on the status of each complaint
            // in that array, we calculate the total number of complaints, resolved and
            // unresolved complaints respectively...
            dept.employees.forEach((employee) => {
              totalComplaints += employee.assignedComplaints.length;
              employee.assignedComplaints.forEach((assignedComplaint) => {
                if (assignedComplaint.status === "RESOLVED") {
                  resolvedComplaints++;
                } else {
                  unresolvedComplaints++;
                }
              });
            });

            var graphData = [
              {
                id: "Unresolved Complaints",
                data: [
                  {
                    x: "Unresolved Complaints",
                    y: unresolvedComplaints,
                  },
                ],
              },
              {
                id: "Resolved Complaints",
                data: [
                  {
                    x: "Resolved Complaints",
                    y: resolvedComplaints,
                  },
                ],
              },
              {
                id: "Filed Complaints",
                data: [
                  {
                    x: "Filed Complaints",
                    y: totalComplaints,
                  },
                ],
              },
            ];

            // const analyticsObj = {
            //   totalComplaints: totalComplaints,
            //   resolvedComplaints: resolvedComplaints,
            //   unresolvedComplaints: unresolvedComplaints,
            // };

            tempObj.department = dept;
            tempObj.complaintsAnalytics = graphData;
            deptAnalytics.push(tempObj);
          });

          res.send({
            status: 200,
            success: true,
            departments: deptAnalytics,
          });
        }
      });
  } catch (err) {
    console.log("ERROR: " + err.message);
  }
};

exports.addSpecificDept = (req, res) => {
  try {
    const company_id = req.params.id;
    const title = req.body.title;
    const categories = req.body.selectedCategories;
    const employees = req.body.selectedEmployees;

    Department.findOne({ company_id: company_id, title: title }).exec(
      (err, dept) => {
        if (err) {
          res.send({
            status: 500,
            success: false,
            message: err.message,
          });
        } else if (dept != null) {
          res.send({
            status: 200,
            success: true,
            message: `${title.toUpperCase()} DEPARTMENT ALREADY EXISTS!`,
            id: dept._id,
          });
        } else {
          Department.create(
            {
              title: title,
              company_id: company_id,
              category: categories.length == 0 ? [] : categories,
              employees: employees.length == 0 ? [] : employees,
            },
            (err, department) => {
              if (err) {
                res.send({
                  status: 500,
                  success: false,
                  message: err.message,
                });
              } else {
                Customer.updateOne(
                  { _id: company_id },
                  {
                    $push: {
                      departments: { _id: department._id },
                    },
                  }
                ).exec((err, customer) => {
                  if (err) {
                    res.send({
                      status: 500,
                      success: false,
                      message: err.message,
                    });
                  } else {
                    var error = false;
                    var message;
                    if (categories.length > 0) {
                      Category.updateMany(
                        { _id: { $in: categories } },
                        { assignedDepartment: department._id }
                      ).exec((err, updatedCategories) => {
                        if (err) {
                          error = true;
                          message = err.message;
                        }
                      });
                    }

                    if (!error) {
                      if (employees.length > 0) {
                        SP.updateMany(
                          { _id: { $in: employees } },
                          { department: department._id }
                        ).exec((err, result) => {
                          if (err) {
                            error = true;
                            message = err.message;
                          }
                        });
                      }
                    }

                    if (!error) {
                      res.send({
                        status: 200,
                        success: true,
                        message: "DEPARTMENT IS SUCCESSFULLY ADDED!",
                      });
                    } else {
                      res.send({
                        status: 500,
                        success: false,
                        message: message,
                      });
                    }
                  }
                });
              }
            }
          );
        }
      }
    );
  } catch (err) {
    console.log("ERROR: " + err.message);
  }
};

exports.getSpecificDept = (req, res) => {
  try {
    const id = req.params.id;
    Department.findOne({ _id: id }).exec((err, dept) => {
      if (err) {
        res.send({
          status: 500,
          success: false,
          message: err.message,
        });
      } else if (dept == null) {
        res.send({
          status: 200,
          success: true,
          message: "DEPARTMENTS NOT FOUND",
        });
      } else {
        res.send({
          status: 200,
          success: true,
          departments: dept,
        });
      }
    });
  } catch (err) {
    console.log("ERROR: " + err.message);
  }
};

exports.updateSpecificDept = (req, res) => {
  try {
    const id = req.params.id;
    const title = req.body.title;

    Department.updateOne({ _id: id }, { title: title }).exec((err, dept) => {
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
          message: "DEPARTMENT IS SUCCESSFULLY UPDATED!",
        });
      }
    });
  } catch (err) {
    console.log("ERROR: " + err.message);
  }
};

// change the findByIdAndDelete to deleteOne later....
// use company_id instead from the request body...
exports.deleteSpecificDept = (req, res) => {
  try {
    const id = req.params.id;
    Department.findByIdAndDelete({ _id: id }).exec((err, dept) => {
      if (err) {
        res.send({
          status: 500,
          success: false,
          message: err.message,
        });
      } else {
        Customer.updateOne(
          { _id: dept.company_id },
          { $pull: { departments: id } }
        ).exec((err, result) => {
          if (err) {
            res.send({
              status: 500,
              success: false,
              message: err.message,
            });
          } else {
            Category.updateMany(
              { assignedDepartment: dept._id },
              { assignedDepartment: null }
            ).exec((err, result) => {
              if (err) {
                res.send({
                  status: 500,
                  success: false,
                  message: err.message,
                });
              } else {
                SP.updateOne(
                  { department: dept._id },
                  { department: null }
                ).exec((err, result) => {
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
                      message: "DEPARTMENT IS SUCCESSFULLY DELETED!",
                    });
                  }
                });
              }
            });
          }
        });
      }
    });
  } catch (err) {
    console.log("ERROR: " + err.message);
  }
};

exports.addEmployeesToDept = (req, res) => {
  try {
    const deptID = req.params.id;
    const spID = req.body.id;
    Department.updateOne(
      { _id: deptID },
      { $push: { employees: { _id: spID } } }
    ).exec((err, result) => {
      if (err) {
        res.send({
          status: 500,
          success: false,
          message: err.message,
        });
      } else {
        SP.updateOne({ user_id: spID }, { department: deptID }).exec(
          (err, result) => {
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
                message:
                  "SERVICEPROVIDER IS SUCCESSFULLY ADDED TO THE DEPARTMENT!",
              });
            }
          }
        );
      }
    });
  } catch (err) {
    console.log("ERROR: " + err.message);
  }
};

exports.removeEmployeesFromDept = (req, res) => {
  try {
    const deptID = req.params.id;
    const spID = req.body.id;

    Department.updateOne({ _id: deptID }, { $pull: { employees: spID } }).exec(
      (err, dept) => {
        if (err) {
          res.send({
            status: 500,
            success: false,
            message: err.message,
          });
        } else {
          SP.updateOne({ _id: spID }, { department: null }).exec(
            (err, result) => {
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
                  message:
                    "SERVICEPROVIDER IS SUCCESSFULLY REMOVED FROM THE DEPARTMENT!",
                });
              }
            }
          );
        }
      }
    );
  } catch (err) {
    console.log("ERROR: " + err.message);
  }
};

exports.getAllDeptEmployees = (req, res) => {
  try {
    const deptID = req.params.id;
    SP.findOne({ department: deptID })
      .populate("user_id")
      .populate("assignedComplaints")
      .populate("ratings")
      .exec((err, data) => {
        if (err) {
          res.send({
            status: 500,
            success: false,
            message: err.message,
          });
        } else if (data == null) {
          res.send({
            status: 200,
            success: true,
            message: "THIS DEPARTMENT DON'T HAVE ANY EMPLOYEES YET!",
          });
        } else {
          res.send({
            status: 200,
            success: true,
            data: data,
          });
        }
      });
  } catch (err) {
    console.log("ERROR: " + err.message);
  }
};

// this will return all the available employees/serviceproviders, which are
// not assigned to any department...
exports.getAvailableEmployees = (req, res) => {
  try {
    const company_id = req.params.id;
    SP.find({ company_id: company_id, department: null })
      .populate("user_id")
      .exec((err, sps) => {
        if (err) {
          res.send({
            status: 500,
            success: false,
            message: err.message,
          });
        } else if (sps.length == 0) {
          // if all the serviceproviders are assigned to some departments...
          res.send({
            status: 200,
            success: true,
            message: "ALL SERVICEPROVIDERS ARE UNAVAILABLE!",
          });
        } else {
          res.send({
            status: 200,
            success: true,
            data: sps,
          });
        }
      });
  } catch (err) {
    console.log("ERROR: " + err.message);
  }
};

/*
=============================================================================
|                         ADMINS' CATEGORIES ROUTES                         |
=============================================================================
*/

exports.getAllCategories = (req, res) => {
  try {
    const company_id = req.params.id;
    Category.find({ company_id: company_id })
      .populate("assignedDepartment")
      .exec((err, categories) => {
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
            data: categories,
          });
        }
      });
  } catch (err) {
    console.log("ERROR: " + err.message);
  }
};

// this will return all the categories that are not assigned to any department...
exports.getUnassignedCategories = (req, res) => {
  try {
    const company_id = req.params.id;
    Category.find({ company_id: company_id, assignedDepartment: null }).exec(
      (err, categories) => {
        if (err) {
          res.send({
            status: 500,
            success: false,
            message: err.message,
          });
        } else if (categories == null) {
          // if all the categories are already assigned to any of the departments...
          res.send({
            status: 200,
            success: true,
            message: "ALL CATEGORIES ARE ASSIGNED!",
          });
        } else {
          res.send({
            status: 200,
            success: true,
            data: categories,
          });
        }
      }
    );
  } catch (err) {
    console.log("ERROR: " + err.message);
  }
};

exports.addCategory = (req, res) => {
  try {
    const company_id = req.params.id;
    const title = req.body.title;
    Category.create(
      {
        company_id: company_id,
        title: title,
        assignedDepartment: null,
      },
      (err, category) => {
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
            message: "CATEGORY IS SUCCESSFULLY ADDED!",
          });
        }
      }
    );
  } catch (err) {
    console.log("ERROR: " + err.message);
  }
};

// this will assign the category to a department...
exports.addCategoryToDept = (req, res) => {
  try {
    const id = req.params.id;
    const category_id = req.body.category_id;
    Category.updateOne({ _id: category_id }, { assignedDepartment: id }).exec(
      (err, category) => {
        if (err) {
          res.send({
            status: 500,
            success: false,
            message: err.message,
          });
        } else {
          Department.updateOne(
            { _id: id },
            { $push: { category: { _id: category_id } } }
          ).exec((err, dept) => {
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
                message: "CATEGORY IS SUCCESSFULLY ADDED TO THE DEPARTMENT!",
              });
            }
          });
        }
      }
    );
  } catch (err) {
    console.log("ERROR: " + err.message);
  }
};

exports.deleteCategory = (req, res) => {
  try {
    const category_id = req.params.id;
    Category.deleteOne({
      _id: category_id,
    }).exec((err, category) => {
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
          message: "CATEGORY IS SUCCESSFULLY DELETED!",
        });
      }
    });
  } catch (err) {
    console.log("ERROR: " + err.message);
  }
};

/*
=============================================================================
|             ADMINS' IMPORT, EXPORT & DELETE CSV ROUTES                    |
=============================================================================
*/

exports.parseCSVFile = (req, res) => {
  try {
    upload(req, res, (err) => {
      if (err instanceof multer.MulterError || err) {
        res.send({
          status: 500,
          success: false,
          message: err.message,
        });
      } else {
        var records = [];
        fs.createReadStream(
          path.join(__dirname, "../", "/public/csv-files/" + req.file.filename)
        )
          .pipe(csv.parse({ headers: true }))
          .on("error", (err) => console.log(err))
          .on("data", (row) => records.push(row))
          .on("end", (rowCount) => {
            var serviceProviders = [],
              complainees = [];
            records.forEach((record) => {
              record.role === "SERVICEPROVIDER"
                ? serviceProviders.push(record)
                : complainees.push(record);
            });
            res.send({
              status: 200,
              success: true,
              file: req.file.filename,
            });
          });
      }
    });
  } catch (error) {
    res.send({
      status: 500,
      success: false,
      message: error.message,
    });
  }
};

exports.deleteUploadedCSVFile = (req, res) => {
  try {
    if (!req.params.csv_file) {
      res.send({
        status: 500,
        success: false,
        message: err.message,
      });
    } else {
      const directory = path.join(
        __dirname,
        "../" + "/public/csv-files/" + req.params.csv_file
      );
      fs.unlinkSync(directory);
      res.send({
        status: 200,
        success: true,
        message: "CSV FILE IS SUCCESSFULLY DELETED!",
      });
    }
  } catch (error) {
    console.log("ERROR: " + error.message);
  }
};
