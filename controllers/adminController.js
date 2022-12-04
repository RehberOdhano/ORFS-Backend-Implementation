// IMPORTED REQUIRED PACKAGES
const {
  csv,
  path,
  fs,
  multer,
  PDFDocument,
  // jwt,
  // KJUR,
  // axios,
  dotenv,
  twilio,
} = require("../utils/packages");
dotenv.config();

// TWILIO CONFIGURATION
const { v4: uuidv4 } = require("uuid");
const AccessToken = twilio.jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;

// UTILITY/HELPER FUNCTIONS
const sendEmail = require("../utils/email");

const { addUsersToQueue } = require("../utils/redis-queue");

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

// admin can view an specific user/employee based on id..
// whether it's a complainee or serviceprovider...
exports.getSpecificUser = (req, res) => {
  const user_id = req.params.id;
  User.findOne({ id: user_id }).exec((err, user) => {
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
        user: user,
      });
    }
  });
};

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
        const query = { email: email },
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
                        level: 0,
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

exports.addMultipleUsers = (req, res) => {
  try {
    upload(req, res, (err) => {
      if (err instanceof multer.MulterError || err) {
        res.send({
          status: 500,
          success: false,
          message: `ERROR: ${err.message}`,
        });
      } else {
        var userRecords = [];
        fs.createReadStream(
          path.join(__dirname, "../", "/public/csv-files/" + req.file.filename)
        )
          .pipe(csv.parse({ headers: true }))
          .on("error", (err) => console.error("ERROR: " + err.message))
          .on("data", (row) => userRecords.push(row))
          .on("end", (rowCount) => {
            userRecords.forEach((record) => {
              if (Object.keys(record).length !== 3) {
                res.send({
                  status: 404,
                  success: false,
                  message:
                    "THE CSV FILE MUST CONTAIN THREE COLUMNS: company_id, email & role",
                });
              }
            });
            res.status(200).send({
              message: "EMAILS WILL BE SUCCESSFULLY SENT AFTER A WHILE!",
            });
            addUsersToQueue(userRecords);
          });
      }
    });
  } catch (err) {
    console.error("ERROR: " + err.message);
  }
};

// admin will only updates the status of the user - whether it's
// a complainee or serviceprovider...
exports.updateUserStatus = (req, res) => {
  try {
    const userID = req.params.id;
    const status = req.body.status;
    User.updateOne(
      { _id: userID, role: { $in: ["COMPLAINEE", "SERVICEPROVIDER"] } },
      { status: status }
    ).exec((err, updatedUser) => {
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
          message: "USER'S STATUS IS SUCCESSFULLY UPDATED!",
        });
      }
    });
  } catch (err) {
    console.log("ERROR: " + err.message);
  }
};

// this will update an specific user...
exports.updateSpecificUser = (req, res) => {
  try {
    const status = req.body.status;
    User.findOneAndUpdate(id, {
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

const generateUsersListPDF = async (pdfDoc, users) => {
  // getting the current date...
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
  var yyyy = today.getFullYear();
  today = mm + "/" + dd + "/" + yyyy;

  pdfDoc.fontSize(8).text(`Date: ${today}`, { align: "right" });

  // table
  let tableRows = [],
    row = [],
    totalComplaintsFiled = 0,
    totalResolvedComplaints = 0;
  users.forEach((user) => {
    row.push(
      user.name,
      user.email,
      user.role,
      user.totalComplaintsFiled,
      user.totalResolvedComplaints
    );
    totalComplaintsFiled += user.totalComplaintsFiled;
    totalResolvedComplaints += user.totalResolvedComplaints;
    tableRows.push(row);
    row = [];
  });

  pdfDoc.fontSize(8).text(`Total Complaints Filed: ${totalComplaintsFiled}`, {
    align: "right",
  });
  pdfDoc
    .fontSize(8)
    .text(`Total Resolved Complaints ${totalResolvedComplaints}`, {
      align: "right",
    });

  const table = {
    title: "User's Statistics",
    headers: [
      "Name",
      "Email",
      "Role",
      "Filed Complaints",
      "Resolved Complaints",
    ],
    rows: tableRows,
  };

  await pdfDoc.table(table, {
    width: 590,
  });

  pdfDoc.end();
  pdfDoc.pipe(
    fs.createWriteStream(
      path.join(
        __dirname,
        "../",
        `/public/csv-files/users-list-${Date.now()}.pdf`
      )
    )
  );

  return `/public/csv-files/users-list-${Date.now()}.pdf`;
};

exports.generateUsersReport = (req, res) => {
  try {
    const company_id = req.params.id;

    Customer.findOne({ _id: company_id })
      .select(["title", "website"])
      .populate([
        {
          path: "employees",
          model: "User",
          match: { role: ["COMPLAINEE", "SERVICEPROVIDER"] },
          select: ["name", "email", "role"],
        },
      ])
      .exec(async (err, users) => {
        if (err) {
          res.send({
            status: 500,
            success: false,
            message: err.message,
          });
        } else {
          let complaineeIDs = [],
            serviceprovideIDs = [];
          users.employees.forEach((employee) => {
            if (employee.role === "COMPLAINEE")
              complaineeIDs.push(employee._id);
            if (employee.role === "SERVICEPROVIDER")
              serviceprovideIDs.push(employee._id);
          });
          Complainee.find({ user_id: { $in: complaineeIDs } })
            .populate("user_id")
            .populate([
              {
                path: "complaints",
                model: "Complaint",
                select: ["status"],
              },
            ])
            .exec((err, complainees) => {
              if (err) {
                res.send(err);
              } else {
                SP.find({ user_id: { $in: serviceprovideIDs } })
                  .populate("user_id")
                  .populate([
                    {
                      path: "assignedComplaints",
                      model: "Complaint",
                      select: ["status"],
                    },
                  ])
                  .exec((err, serviceproviders) => {
                    if (err) {
                      res.send(err);
                    } else {
                      let sps = [],
                        complaineesArr = [];
                      let spObj = {},
                        compObj = {};
                      let count = 0;

                      serviceproviders.forEach((serviceprovider) => {
                        spObj["name"] = serviceprovider.user_id.name;
                        spObj["email"] = serviceprovider.user_id.email;
                        spObj["role"] = serviceprovider.user_id.role;
                        spObj["totalComplaintsFiled"] = 0;
                        serviceprovider.assignedComplaints.forEach(
                          (complaint) => {
                            if (complaint.status == "RESOLVED") count++;
                          }
                        );
                        spObj["totalResolvedComplaints"] = count;
                        count = 0;
                        sps.push(spObj);
                        spObj = {};
                      });

                      complainees.forEach((complainee) => {
                        compObj["name"] = complainee.user_id.name;
                        compObj["email"] = complainee.user_id.email;
                        compObj["role"] = complainee.user_id.role;
                        compObj["totalResolvedComplaints"] = 0;
                        compObj["totalComplaintsFiled"] =
                          complainee.complaints.length;
                        complaineesArr.push(compObj);
                        compObj = {};
                      });

                      let data = [];
                      complaineesArr.forEach((complainee) =>
                        data.push(complainee)
                      );
                      sps.forEach((sp) => data.push(sp));
                      const pdfDoc = new PDFDocument({
                        margin: 20,
                        size: "A4",
                      });

                      generateUsersListPDF(pdfDoc, data)
                        .then((link) => {
                          res.send({
                            status: 200,
                            success: true,
                            data: link,
                          });
                        })
                        .catch((err) => {
                          res.send({
                            status: 500,
                            success: false,
                            message: err.message,
                          });
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

// exports.deleteMultipleUsers = (req, res) => {
//   try {
//     const company_id = mongoose.Types.ObjectId(req.params.company_id);
//     const user_ids = req.body.ids.map((id) => mongoose.Types.ObjectId(id));
//     const role = req.body.role;
//     var error = false;
//     User.deleteMany({ _id: { $in: user_ids } }).exec((err, users) => {
//       if (err) {
//         error = true;
//       } else {
//         if (role == "COMPLAINEE") {
//           Complainee.deleteMany({ _id: { $in: user_ids } }).exec(
//             (err, complainees) => {
//               if (err) {
//                 error = true;
//               }
//             }
//           );
//         } else if (role == "SERVICEPROVIDER") {
//           SP.deleteMany({ user_id: { $in: user_ids } }).exec((err, sps) => {
//             if (err) {
//               error = true;
//             }
//           });
//         }
//       }
//       if (!error) {
//         Customer.findByIdAndUpdate(
//           { _id: company_id },
//           { $pull: { employees: { _id: { $in: user_ids } } } }
//         ).exec((err, users) => {
//           if (err) {
//             res.send({
//               status: 500,
//               success: false,
//               message: err.message,
//             });
//           } else {
//             res.send({
//               status: 200,
//               success: true,
//               message: "USERS ARE SUCCESSFULLY DELETED!",
//             });
//           }
//         });
//       } else {
//         res.send({
//           status: 500,
//           success: false,
//           message: "NOT ABLE TO DELETE THE USERS!",
//         });
//       }
//     });
//   } catch (err) {
//     console.log("ERROR: " + err.message);
//   }
// };

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
    Complaint.find({ company_id: company_id })
      .lean()
      .populate("category")
      .populate([
        {
          path: "assignedTo",
          populate: {
            path: "user_id",
            model: "User",
          },
        },
        {
          path: "complainee_id",
          model: "User",
          select: ["name", "email", "pfp"],
        },
      ])
      .exec((err, complaints) => {
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
    Department.findByIdAndUpdate(
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
        SP.findByIdAndUpdate(
          { _id: spID },
          { department: deptID },
          { upsert: true }
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
              message:
                "SERVICEPROVIDER IS SUCCESSFULLY ADDED TO THE DEPARTMENT!",
            });
          }
        });
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

    console.log(deptID, spID);

    Department.findOneAndUpdate(
      { _id: deptID },
      {
        $pull: { employees: spID },
      }
    ).exec((err, dept) => {
      if (err) {
        res.send({
          status: 500,
          success: false,
          message: err.message,
        });
      } else {
        SP.findOneAndUpdate({ _id: spID }, { department: null }).exec(
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
    });
  } catch (err) {
    console.log("ERROR: " + err.message);
  }
};

exports.getAllDeptEmployees = (req, res) => {
  console.log(req.body);
  try {
    const deptID = req.params.id;
    SP.find({ department: deptID })
      .populate("user_id")
      .populate("assignedComplaints")
      // .populate("ratings")
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

// HELPER FUNCTION FOR GENERATING PDF
// this function will extract the needed data from the data that is
// fetched from the database...
const extractData = (data) => {
  let deptAnalytics = [];
  data.forEach((item) => {
    let obj = {};
    obj["company_title"] = item.company_id.title;
    obj["company_website"] = item.company_id.website;
    obj["dept_title"] = item.title;
    let resolvedComplaints = 0,
      totalComplaints = 0;
    let avgRating = 0,
      totalSPs = item.employees.length;
    // calculating the average rating of the department and the number of
    // resolved complaints...
    item.employees.forEach((employee) => {
      avgRating += employee.averageRating;
      totalComplaints += employee.assignedComplaints.length;
      employee.assignedComplaints.forEach((complaint) => {
        if (complaint.status == "RESOLVED") resolvedComplaints++;
      });
    });
    obj["total_complaints"] = totalComplaints;
    obj["resolved_complaints"] = resolvedComplaints;
    obj["complaint_completion_pct"] =
      totalComplaints != 0 ? (resolvedComplaints / totalComplaints) * 100 : 0;
    obj["rating"] = totalSPs != 0 ? (avgRating / totalSPs) * 100 : 0;
    deptAnalytics.push(obj);
  });

  return deptAnalytics;
};

const generatePDF = async (pdfDoc, extractedData) => {
  // getting the current date...
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
  var yyyy = today.getFullYear();
  today = mm + "/" + dd + "/" + yyyy;
  pdfDoc.fontSize(8).text(today, { align: "right" });

  // table
  let tableRows = [],
    row = [];
  extractedData.forEach((data) => {
    row.push(
      data.company_title,
      data.company_website,
      data.dept_title,
      data.total_complaints,
      data.resolved_complaints,
      data.complaint_completion_pct,
      data.rating
    );
    tableRows.push(row);
    row = [];
  });

  const table = {
    title: "Department Statistics",
    headers: [
      "Company Name",
      "Company Website",
      "Department Title",
      "Total Complaints",
      "Resolved Complaints",
      "Completion %",
      "Rating",
    ],
    rows: tableRows,
  };

  await pdfDoc.table(table, {
    width: 590,
  });

  pdfDoc.end();
  pdfDoc.pipe(
    fs.createWriteStream(
      path.join(
        __dirname,
        "../",
        `/public/csv-files/department-report-${Date.now()}.pdf`
      )
    )
  );

  return `/public/csv-files/department-report-${Date.now()}.pdf`;
};

exports.generateDeptReport = (req, res) => {
  try {
    const company_id = req.params.id;
    Department.find({ company_id: company_id })
      .populate([
        "company_id",
        "category",
        {
          path: "employees",
          populate: {
            path: "assignedComplaints",
            model: "Complaint",
          },
        },
      ])
      .exec(async (err, data) => {
        if (err) {
          res.send({
            status: 500,
            success: false,
            message: err.message,
          });
        } else {
          const extractedData = extractData(data);
          // creating a new pdf document
          const pdfDoc = new PDFDocument({ margin: 20, size: "A4" });
          generatePDF(pdfDoc, extractedData)
            .then((link) => {
              res.send({
                status: 200,
                success: true,
                data: link,
              });
            })
            .catch((err) => {
              res.send({
                status: 500,
                success: false,
                message: err.message,
              });
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
    const categoryIDs = req.body.ids;
    Category.updateMany(
      { _id: { $in: categoryIDs } },
      { assignedDepartment: id }
    ).exec((err, category) => {
      if (err) {
        res.send({
          status: 500,
          success: false,
          message: err.message,
        });
      } else {
        Department.updateOne(
          { _id: id },
          { $push: { category: categoryIDs } }
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
    });
  } catch (err) {
    console.log("ERROR: " + err.message);
  }
};

exports.removeCategoryToDept = (req, res) => {
  try {
    console.log(req.body);
    const deptID = req.params.id;
    const categoryID = req.body.id;
    Department.findOneAndUpdate(
      { _id: deptID },
      { $pull: { category: categoryID } }
    ).exec((err, updatedOne) => {
      if (err) {
        res.send({
          status: 500,
          success: false,
          message: err.message,
        });
      } else {
        Category.updateOne(
          { _id: categoryID },
          { assignedDepartment: null }
        ).exec((err, updatedOne) => {
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
              message: "CATEGORY IS SUCCESSFULLY REMOVED FROM THE DEPARTMENT!",
            });
          }
        });
      }
    });
  } catch (err) {
    console.error("ERROR: " + err.message);
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
              if (Object.keys(record).length === 3) {
                record.role === "SERVICEPROVIDER"
                  ? serviceProviders.push(record)
                  : complainees.push(record);
              } else {
                res.send({
                  status: 404,
                  success: false,
                  message:
                    "THE CSV FILE MUST CONTAINS THREE COLUMNS: company_id, role & email",
                });
              }
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

/*
=============================================================================
|                      LEADERBOARD & GAMIFICATION ROUTES                    |
=============================================================================
*/

exports.getAvgRatingOfSpsOfDept = (req, res) => {
  try {
    const deptId = req.params.id;
    Department.findOne({ _id: deptId })
      .populate({ path: "employees", model: "ServiceProvider" })
      .select("employees")
      .exec((err, data) => {
        if (err) {
          res.send({
            status: 500,
            success: false,
            message: err.message,
          });
        } else {
          const serviceproviders = data.employees;
          let avgRatingOfDept = 0;
          if (serviceproviders.length > 0) {
            serviceproviders.forEach(
              (serviceprovider) =>
                (avgRatingOfDept += serviceprovider.averageRating)
            );
            avgRatingOfDept /= serviceproviders.length;
          }
          res.send({
            status: 200,
            success: true,
            averageRatingOfDept: avgRatingOfDept,
          });
        }
      });
  } catch (err) {
    console.error("ERROR: " + err.message);
  }
};

exports.getAvgRatingOfSpsOfCustomer = (req, res) => {
  try {
    const companyId = req.params.id;
    SP.find({ company_id: companyId }).exec((err, serviceproviders) => {
      if (err) {
        res.send({
          status: 500,
          success: false,
          message: err.message,
        });
      } else {
        let avgRatingOfCompany = 0;
        if (serviceproviders.length > 0) {
          serviceproviders.forEach(
            (sp) => (avgRatingOfCompany += sp.averageRating)
          );
          avgRatingOfCompany /= serviceproviders.length;
        }
        res.send({
          status: 200,
          success: true,
          avgRatingOfCompany: avgRatingOfCompany,
        });
      }
    });
  } catch (err) {
    console.error("ERROR: " + err.message);
  }
};

/*
=============================================================================
|                         SUBSCRIPTIONS' ROUTES                             |
=============================================================================
*/

exports.getCurrentSubscription = (req, res) => {
  try {
    const companyId = req.params.id;
    Customer.findOne({ _id: companyId })
      .populate("subscription_plan")
      .exec((err, currSubscription) => {
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
            data: currSubscription,
          });
        }
      });
  } catch (err) {
    console.err("ERROR:" + err.message);
    res.send({
      status: 500,
      success: false,
      message: err.message,
    });
  }
};

/*
=============================================================================
|                      ZOOM: AUDIO/VIDEO CHAT ROUTES                        |
=============================================================================
*/

// this function will create a zoom meeting
// 1. generates a sdkJWT
// 2. gets user token or ZAK(Zoom Access Token)
// 3. send the response back to the client
// exports.createZoomMeeting = (req, res) => {
//   try {
//     const { role } = req.body;
//     const meetingNumber = Math.floor(10000 + Math.random() * 9999);
//     const iat = Math.round((new Date().getTime() - 30000) / 1000);
//     const exp = iat + 60 * 60 * 2;
//     const oHeader = { alg: "HS256", typ: "JWT" };

//     const oPayload = {
//       sdkKey: process.env.SDK_KEY,
//       mn: meetingNumber,
//       role: role,
//       iat: iat,
//       exp: exp,
//       appKey: process.env.SDK_SECRET_KEY,
//       tokenExp: iat + 60 * 60 * 2,
//     };

//     const sHeader = JSON.stringify(oHeader);
//     const sPayload = JSON.stringify(oPayload);
//     const sdkJWT = KJUR.jws.JWS.sign(
//       "HS256",
//       sHeader,
//       sPayload,
//       process.env.SDK_SECRET_KEY
//     );
//     console.log(sdkJWT);

//     res.send({
//       status: 200,
//       success: true,
//       sdkJWT: sdkJWT,
//     });
//   } catch (error) {
//     console.error("ERROR: " + error.message);
//     res.status(500).send({ message: error.message });
//   }
// };

/*
=============================================================================
|                      TWILIO: AUDIO/VIDEO CHAT ROUTES                      |
=============================================================================
*/

// HELPER FUNCTIONS FOR "createTwilioMeeting"
const findOrCreateRoom = async (roomName) => {
  try {
    // see if the room exists already. If it doesn't, this will throw
    // error 20404.
    await twilioClient.video.rooms(roomName).fetch();
  } catch (error) {
    // the room was not found, so create it
    if (error.code == 20404) {
      await twilioClient.video.rooms.create({
        uniqueName: roomName,
        type: "go",
      });
    } else {
      // let other errors bubble up
      throw error;
    }
  }
};

const getAccessToken = (roomName) => {
  // create an access token
  const token = new AccessToken(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_API_KEY_SID,
    process.env.TWILIO_API_KEY_SECRET,
    // generate a random unique identity for this participant
    { identity: uuidv4() }
  );
  // create a video grant for this specific room
  const videoGrant = new VideoGrant({
    room: roomName,
  });

  // add the video grant
  token.addGrant(videoGrant);
  // serialize the token and return it
  return token.toJwt();
};

exports.createTwilioMeeting = (req, res) => {
  try {
    // return 400 if the request has an empty body or no roomName
    console.log(req.body);
    if (!req.body || !req.body.roomName) {
      return res.status(400).send("Must include roomName argument.");
    }
    const roomName = req.body.roomName;
    // find or create a room with the given roomName
    findOrCreateRoom(roomName);
    // generate an Access Token for a participant in this room
    const token = getAccessToken(roomName);
    console.log(token);
    res.status(200).send({ token: token });
  } catch (err) {
    console.log("ERROR:" + err.message);
    res.status(500).send({ message: err.message });
  }
};

/*
=============================================================================
|                           KNOWLEDGEBASE ROUTES                            |
=============================================================================
*/

exports.getGuides = (req, res) => {
  try {
    Guide.find({}).exec((err, guides) => {
      if (err) {
        res.status(500).send({ message: err.message });
      } else {
        res.status(200).send({ data: guides, message: err.message });
      }
    });
  } catch (err) {
    console.log("ERROR:" + err.message);
    res.status(500).send({ message: err.message });
  }
};
