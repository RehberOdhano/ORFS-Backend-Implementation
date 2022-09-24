const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const csv = require("fast-csv");
const path = require("path");
const fs = require("fs");

// MODELS
const User = require("../models/user");
const Complaint = require("../models/complaint");
const Category = require("../models/category");
const Customer = require("../models/customer");
const Department = require("../models/department");
const Complainee = require("../models/complainee");
const SP = require("../models/serviceProvider");
const Token = require("../models/token");

/*
=============================================================================
|                         ADMINS' USERS' ROUTES                             |
=============================================================================
*/
// this will return a list of all the registered users...
exports.getUsersList = (req, res) => {
  try {
    const company_id = mongoose.Types.ObjectId(req.params.id);
    User.find({ company_id: company_id }).exec((err, users) => {
      if (err)
        res.send({
          status: 500,
          success: false,
          message: err.message,
        });
      else if (users == null)
        res.send({
          status: 200,
          success: true,
          message: "USERS DOES NOT EXIST!",
        });
      else
        res.send({
          status: 200,
          success: true,
          users: users,
        });
    });
  } catch (err) {
    console.error("ERROR: " + err.message);
  }
};

// exports.getSpecificUser = async(req, res) => {
//     const user_id = req.params.id;
//     await User.findOne({ id: user_id }, (err, user) => {
//         if (err) res.send("USER DOES NOT EXIST!");
//         else res.send(user);
//     });
// }

// this will add a new user... and based on it's role, i.e. either the user
// is complainee or serviceprovider, a new document will also be created in that
// particular collection...
exports.addSpecificUser = (req, res) => {
  try {
    let salt = bcrypt.genSaltSync(10);
    const name = req.body.name;
    const email = req.body.email;
    const role = req.body.role;
    var user_id = "";
    User.findOne({ email: email }).exec((err, user) => {
      if (err) {
        res.send({
          status: 500,
          success: false,
          message: err.message,
        });
      } else if (user) {
        res.send({
          status: 500,
          success: false,
          message: "USER WITH THIS EMAIL IS ALREADY EXISTS!",
        });
      } else {
        User.create(
          {
            name: name,
            email: email,
            password: bcrypt.hashSync("user", salt),
            role: role,
            sign_type: "PLATFORM",
            company_id: req.params.id,
          },
          (err, user) => {
            if (err) {
              res.send({
                status: 500,
                success: false,
                message: err.message,
              });
            } else {
              user_id = user.id;
              Customer.updateOne(
                { _id: user.company_id },
                { $push: { employees: { email: user.email, _id: user_id } } }
              ).exec((err, user) => {
                if (err) {
                  res.send({
                    status: 500,
                    success: false,
                    message: err.message,
                  });
                } else {
                  if (role == "COMPLAINEE") {
                    Complainee.create(
                      {
                        _id: user_id,
                        company_id: req.params.id,
                      },
                      (err, user) => {
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
                            message: "BOTH USER AND COMPLAINEE ARE CREATED!",
                            user: user,
                          });
                        }
                      }
                    );
                  } else if (role == "SERVICEPROVIDER") {
                    SP.create(
                      {
                        user_id: user_id,
                        company_id: req.params.id,
                        averageRating: 0,
                      },
                      (err, user) => {
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
                              "BOTH USER AND SERVICEPROVIDER ARE CREATED!",
                            user: user,
                          });
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
    console.error("ERROR: " + err.message);
    return;
  }
};

// this will update an specific user...
exports.updateSpecificUser = async (req, res) => {
  try {
    const id = req.params.id;
    const name = req.body.name;
    const email = req.body.email;
    User.findByIdAndUpdate(id, { name: name, email: email }).exec(
      (err, user) => {
        if (err) {
          res.send({
            status: 500,
            success: false,
            message: err.message,
          });
        } else if (user == null) {
          res.send({
            status: 200,
            success: true,
            message: "USER DOES NOT EXIST!",
          });
        } else {
          res.send({
            status: 200,
            success: true,
            message: "USER IS SUCCESSFULLY UPDATED!",
          });
        }
      }
    );
  } catch (err) {
    console.error("ERROR: " + err);
  }
};

// this will delete a user's record from the collection and based on the role,
// i.e. if the user is complainee, then a record from the complainee's collection
// will also be deleted and same for the role = serviceprovider... and after that,
// the user will also be removed from the company's employees list...
exports.deleteSpecificUser = (req, res) => {
  try {
    const company_id = req.params.id;
    const user_id = req.body.id;
    User.findById({ _id: user_id }, function (err, user) {
      if (err) {
        res.send({
          status: 500,
          success: false,
          message: err.message,
        });
      } else if (user == null) {
        res.send({
          status: 200,
          success: true,
          message: "USER DOES NOT EXIST!",
        });
      } else {
        user.remove();
        if (user.role == "COMPLAINEE") {
          Complainee.deleteOne({ _id: user._id }).exec();
        } else if (user.role == "SERVICEPROVIDER") {
          SP.deleteOne({ user_id: user._id }).exec();
        }
        Customer.updateOne(
          { _id: company_id },
          { $pull: { employees: { _id: user_id } } }
        ).exec((err, employee) => {
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
  } catch (err) {
    console.error("ERROR: " + err.message);
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
    console.error("ERROR: " + err.message);
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
    console.error("ERROR: " + err.message);
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
    const title = req.body.title;
    const description = req.body.description;
    const category = req.body.category;
    const workUpdate = req.body.workUpdate;
    const status = req.body.status;

    Complaint.findByIdAndUpdate(id, {
      title: title,
      description: description,
      category: category,
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
  } catch (err) {
    console.error("ERROR:" + err.message);
  }
};

exports.archiveSpecificComplaint = (req, res) => {
  try {
    const id = req.params.id;
    Complaint.findByIdAndUpdate(id, { status: "ARCHIVED" }).exec(
      (err, complaint) => {
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
      }
    );
  } catch (err) {
    console.error("ERROR: " + err.message);
  }
};

exports.deleteSpecificComplaint = (req, res) => {
  try {
    const id = req.params.id;
    Complaint.deleteOne({ _id: id }).exec((err, complaint) => {
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
          message: "COMPLAINT IS SUCCESSFULLY DELETED!",
        });
      }
    });
  } catch (err) {
    console.error("ERROR:" + err.message);
  }
};

exports.assignComplaint = (req, res) => {
  try {
    const complaintID = req.params.id;
    const spID = req.body.id;
    Complaint.findByIdAndUpdate(
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
        SP.findByIdAndUpdate(
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
    Department.find({ company_id: req.params.id }).exec((err, depts) => {
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
        res.send({
          status: 200,
          success: true,
          departments: depts,
        });
      }
    });
  } catch (err) {
    console.error("ERROR: " + err.message);
  }
};

exports.getSpecificDept = (req, res) => {
  try {
    const id = mongoose.Types.ObjectId(req.params.id);
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
    console.error("ERROR: " + err.message);
  }
};

exports.addSpecificDept = (req, res) => {
  try {
    const title = req.body.title;
    const company_id = req.params.id;
    Department.findOne({ title: title }).exec((err, dept) => {
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
        });
      } else {
        Department.create(
          {
            title: title,
            company_id: company_id,
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
                    departments: { title: title, _id: department._id },
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
                  res.send({
                    status: 200,
                    success: true,
                    message: "DEPARTMENT IS SUCCESSFULLY ADDED!",
                  });
                }
              });
            }
          }
        );
      }
    });
  } catch (err) {
    console.error("ERROR: " + err.message);
  }
};

exports.updateSpecificDept = (req, res) => {
  try {
    const id = req.params.id;
    const title = req.body.title;

    let query = Department.findOne({ _id: id });
    query.select(["company_id"]);
    query.exec((err, dept) => {
      if (err) {
        res.send({
          status: 500,
          success: false,
          message: err.message,
        });
      } else {
        JSON.stringify(dept);
        const company_id = dept.company_id;
        Customer.updateOne(
          { _id: company_id, "departments._id": id },
          { $set: { "departments.$.title": title } }
        ).exec((err, customer) => {
          if (err) {
            res.send({
              status: 500,
              success: false,
              message: err.message,
            });
          } else {
            Department.updateOne({ _id: id }, { title: title }).exec(
              (err, dept) => {
                if (!err) {
                  res.send({
                    status: 200,
                    success: true,
                    message: "DEPARTMENT IS SUCCESSFULLY UPDATED!",
                  });
                }
              }
            );
          }
        });
      }
    });
  } catch (err) {
    console.error("ERROR: " + err.message);
  }
};

// check when correct data is available
exports.deleteSpecificDept = (req, res) => {
  try {
    const id = req.params.id;
    Department.deleteOne({ _id: id }).exec((err, dept) => {
      if (err) {
        res.send({
          status: 500,
          success: false,
          message: err.message,
        });
      } else {
        JSON.stringify(dept);
        console.log("dept: " + dept);
        Customer.updateOne(
          { _id: dept.company_id },
          { $pull: { departments: { _id: id } } }
        ).exec((err, result) => {
          if (err) {
            res.send({
              status: 500,
              success: false,
              message: err.message,
            });
          } else {
            console.log("customer: " + result);
            Category.updateOne(
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
                console.log("category: " + result);
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
                    console.log("sp: " + result);
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
    console.error("ERROR: " + err.message);
  }
};

exports.addDeptEmployee = (req, res) => {
  try {
    const email = req.body.email;
    const id = req.params.id;
    User.findOne({ email: email }).exec((err, user) => {
      if (err) {
        res.send({
          status: 500,
          success: false,
          message: err.message,
        });
      } else if (user != null) {
        res.send({
          status: 200,
          success: true,
          message: `USER WITH EMAIL: ${user.email} ALREADY EXISTS!`,
        });
      } else {
        let salt = bcrypt.genSaltSync(10);
        User.create(
          {
            name: req.body.name,
            email: req.body.email,
            password: bcrypt.hashSync("sp123", salt),
            role: "SERVICEPROVIDER",
            sign_type: "PLATFORM",
            company_id: mongoose.Types.ObjectId(req.body.company_id),
          },
          (err, user) => {
            if (err) {
              res.send({
                status: 500,
                success: false,
                message: err.message,
              });
            } else {
              const spID = user._id;
              Department.updateOne(
                { _id: id },
                { $push: { employees: { _id: spID, email: email } } }
              ).exec((err, dept) => {
                if (err) {
                  res.send({
                    status: 500,
                    success: false,
                    message: err.message,
                  });
                } else {
                  SP.updateOne({ user_id: spID }, { department: id }).exec(
                    (err, sp) => {
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
                          message: "EMPLOYEE IS SUCCESSFULLY ADDED!",
                        });
                      }
                    }
                  );
                }
              });
            }
          }
        );
      }
    });
  } catch (err) {
    console.error("ERROR: " + err.message);
  }
};

exports.deleteDeptEmployee = (req, res) => {
  try {
    const deptID = req.params.id;
    const empID = mongoose.Types.ObjectId(req.body.id);

    Department.updateOne(
      { _id: deptID },
      { $pull: { employees: { _id: empID } } }
    ).exec((err, dept) => {
      if (err) {
        res.send({
          status: 500,
          success: false,
          message: err.message,
        });
      } else {
        User.deleteOne({ _id: empID }).exec((err, user) => {
          if (err) {
            res.send({
              status: 500,
              success: false,
              message: err.message,
            });
          } else {
            SP.deleteOne({ user_id: empID }).exec((err, sp) => {
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
                  message: "EMPLOYEE IS SUCCESSFULLY DELETED!",
                });
              }
            });
          }
        });
      }
    });
  } catch (err) {
    console.error("ERROR: " + err.message);
  }
};

exports.getAllDeptEmployees = (req, res) => {
  try {
    const id = req.params.id;
    Department.findOne({ _id: id }, "employees").exec((err, dept) => {
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
          message: "THIS DEPARTMENT DON'T HAVE ANY EMPLOYEES YET!",
        });
      } else {
        const employees = dept.employees;
        var emails = [],
          spIDs = [],
          names = [];
        employees.forEach((employee) => emails.push(employee.email));
        User.find({ email: { $in: emails } }).exec((err, users) => {
          if (err) {
            res.send({
              status: 500,
              success: false,
              message: err.message,
            });
          } else {
            // based on the emails, we'll get all the users in a list
            // and from that list we'll extract all the names and ids
            users.forEach((user) => {
              spIDs.push(user._id);
              names.push(user.name);
            });
            // based on the extracted ids, we'll find the serviceproviders
            SP.find({ user_id: { $in: spIDs } }).exec((err, sps) => {
              if (err) {
                res.send({
                  status: 500,
                  success: false,
                  message: err.message,
                });
              } else {
                var listOfUsers = [];
                var i = 0;
                sps.forEach((sp) => {
                  var userObj = {
                    userID: spIDs[i],
                    company_id: sp.company_id,
                    name: names[i],
                    email: emails[i],
                    feedbackGiven: sp.feedbackGiven,
                    ratings: sp.ratings,
                    avgRating: sp.avgRating,
                    department: sp.department,
                    assignedComplaints: sp.assignedComplaints,
                    pfp: sp.pfp || null,
                  };
                  listOfUsers.push(userObj);
                  i++;
                });
                res.send({
                  status: 200,
                  success: true,
                  data: listOfUsers,
                });
              }
            });
          }
        });
      }
    });
  } catch (err) {
    console.error("ERROR: " + err.message);
  }
};

// this will return all the available employees/serviceproviders, which are
// not assigned to any department...
exports.getAvailableEmployees = (req, res) => {
  try {
    const company_id = req.params.id;
    SP.find({ company_id: company_id, department: null }).exec((err, sps) => {
      if (err) {
        res.send({
          status: 500,
          success: false,
          message: err.message,
        });
      } else if (sps == null) {
        // this means all serviceproviders are assigned to some departments...
        res.send({
          status: 200,
          success: false,
          message: "ALL SERVICEPROVIDERS ARE UNAVAILABLE!",
        });
      } else {
        // extracting the ids of the available serviceproviders...
        var userIDs = [];
        sps.forEach((sp) => userIDs.push(sp.user_id));
        // based on these extracted ids, we'll get the user's data...
        User.find({ _id: { $in: userIDs } }).exec((err, users) => {
          if (err) {
            res.send({
              status: 500,
              success: false,
              message: err.message,
            });
          } else {
            // based on the ids, extracted earlier, we'll get the user's data
            // and from that data, here we're extracting the names and emails...
            var names = [];
            var emails = [];
            users.forEach((user) => {
              names.push(user.name);
              emails.push(user.email);
            });
            // making a list of user's objects, in which each object will contain
            // the entire data like id, company_id, name, email, etc...
            var listOfSPs = [];
            var counter = 0;
            sps.forEach((sp) => {
              const obj = {
                user_id: sp.user_id,
                company_id: sp.company_id,
                name: names[counter],
                email: emails[counter],
                feedbackGiven: sp.feedbackGiven,
                ratings: sp.ratings,
                department: sp.department,
                avgRating: sp.averageRating,
                assignedComplaints: sp.assignedComplaints,
                pfp: sp.pfp || null,
              };
              listOfSPs.push(obj);
              counter++;
            });
            res.send({
              status: 200,
              success: true,
              data: listOfSPs,
            });
          }
        });
      }
    });
  } catch (err) {
    console.error("ERROR: " + err.message);
  }
};

/*
=============================================================================
|                         ADMINS' CATEGORIES ROUTES                         |
=============================================================================
*/

// this will return all the categories...
exports.getAllCategories = (req, res) => {
  try {
    const company_id = req.params.id;
    Category.find({ company_id: company_id }).exec((err, categories) => {
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
    console.error("ERROR: " + err.message);
  }
};

// this will return all the categories that are not assigned to a department...
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
          // this means that all categories are already assigned to the departments...
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
    console.error("ERROR: " + err.message);
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
    console.error("ERROR: " + err.message);
  }
};

// this will assign the category to a department...
exports.addCategoryToDept = (req, res) => {
  try {
    const id = req.params.id;
    const category_id = mongoose.Types.ObjectId(req.body.category_id);
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
    console.error("ERROR: " + err.message);
  }
};

exports.deleteCategory = (req, res) => {
  try {
    const company_id = req.params.id;
    const category_id = mongoose.Types.ObjectId(req.body.id);
    Category.findByIdAndDelete({
      _id: category_id,
      company_id: company_id,
    }).exec((err, category) => {
      if (err) {
        res.send({
          status: 500,
          success: false,
          message: err.message,
        });
      } else {
        // if this category is already assigned to any department, then
        // using that department's id, we'll remove the category from the
        // categories array in the department's collection...
        if (category.assignedDepartment) {
          const id = category.assignedDepartment._id;
          Department.updateOne(
            { _id: id },
            { $pull: { category: { _id: category._id } } }
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
                message:
                  "CATEGORY IS SUCCESSFULLY DELETED AND UNASSIGNED FROM THE DEPARTMENT AS WELL!",
              });
            }
          });
        } else {
          res.send({
            status: 200,
            success: true,
            message: "CATEGORY IS SUCCESSFULLY DELETED!",
          });
        }
      }
    });
  } catch (err) {
    console.error("ERROR: " + err.message);
  }
};

/*
=============================================================================
|             ADMINS' IMPORT, EXPORT & DELETE CSV ROUTES                    |
=============================================================================
*/

exports.parseCSVFile = (req, res) => {
  try {
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

        // try {
        //   Complainee.insertMany(complainees);
        //   SP.insertMany(serviceProviders);
        //   res.send({
        //     status: 200,
        //     success: true,
        //     data: records,
        //   });
        // } catch (error) {
        //   res.send({
        //     status: 500,
        //     success: false,
        //     message: error.message,
        //   });
        // }
      });
  } catch (error) {
    res.send({
      status: 500,
      success: false,
      message: err.message,
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
