// IMPORTED REQUIRED PACKAGES
const { bcrypt } = require("../utils/packages");

// UTILITY/HELPER FUNCTIONS
const sendEmail = require("../utils/email");

// MODELS
const Customer = require("../models/customer");
const Department = require("../models/department");
const User = require("../models/user");
const Complaint = require("../models/complaint");
const Complainee = require("../models/complainee");
const Category = require("../models/category");
const SP = require("../models/serviceProvider");
const CustomerType = require("../models/customerType");
const Token = require("../models/token");
const Subscription = require("../models/subscription");

/*
=============================================================================
|                         SUPERADMINS' ROUTES                               |
=============================================================================
*/

exports.getAllCustomers = (req, res) => {
  try {
    Customer.find({})
      .populate("employees")
      .exec((err, customers) => {
        if (err) {
          res.send({
            status: 500,
            success: false,
            message: err.message,
          });
        } else if (customers == null || !customers.length) {
          res.send({
            status: 200,
            success: true,
            message: "CUSTOMERS AREN'T REGISTERED YET!",
          });
        } else {
          res.send({
            status: 200,
            success: true,
            customers: customers,
          });
        }
      });
  } catch (err) {
    console.log("ERROR: " + err.message);
  }
};

exports.addCustomer = (req, res) => {
  try {
    Customer.findOne({
      $or: [{ website: req.body.website }, { title: req.body.title }],
    }).exec((err, customer) => {
      if (err) {
        res.send({
          status: 500,
          success: false,
          message: err.message,
        });
      } else if (customer) {
        res.send({
          status: 200,
          success: true,
          message: "CUSTOMER WITH THIS WEBSITE/TITLE ALREADY EXISTS!",
        });
      } else {
        Customer.create(
          {
            title: req.body.title,
            website: req.body.website,
            status: "ONBOARDING",
            customerTypeId: req.body.customer_type._id,
            pfp: req.body.pfp,
            dateRegistered: Date.now(),
          },
          (err, customer) => {
            if (err) {
              res.send({
                status: 500,
                success: false,
                message: err.message,
              });
            } else {
              const companyId = customer._id;
              const today = new Date(); // current date
              console.log(today);
              console.log(today.getDate());
              const duration = req.body.subscription_plan.duration; // number of months
              const numOfDays = duration * 30; // number of days
              const expiryDate = today.setDate(today.getDate() + numOfDays);
              console.log(today);
              console.log(expiryDate);

              Subscription.create(
                {
                  company_id: companyId,
                  price: 0,
                  duration: duration,
                  datePurchased: today,
                  dateTillExpiry: expiryDate,
                },
                (err, subscription) => {
                  if (err) {
                    res.send({
                      status: 500,
                      success: false,
                      message: err.message,
                    });
                  } else {
                    Customer.updateOne(
                      { _id: companyId },
                      { subscription_plan: subscription._id }
                    ).exec((err, updatedCustomer) => {
                      if (err) {
                        res.send({
                          status: 500,
                          success: false,
                          message: err.message,
                        });
                      } else {
                        User.findOne({ email: req.body.email }).exec(
                          (err, user) => {
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
                                message: `USER WITH THIS EMAIL ${user.email} ALREADY EXISTS!`,
                                user_id: user._id,
                                company_id: companyId,
                              });
                            } else {
                              const query = { email: req.body.email },
                                update = {
                                  email: req.body.email,
                                  role: "ADMIN",
                                  company_id: companyId,
                                },
                                options = { new: true, upsert: true };
                              User.findOneAndUpdate(
                                query,
                                update,
                                options
                              ).exec((err, user) => {
                                if (err) {
                                  res.send({
                                    status: 500,
                                    success: false,
                                    message: err.message,
                                  });
                                } else {
                                  Customer.updateOne(
                                    { website: req.body.website },
                                    {
                                      $push: { employees: { _id: user._id } },
                                    }
                                  ).exec(async (err, customer) => {
                                    if (err) {
                                      res.send({
                                        status: 500,
                                        success: false,
                                        message: err.message,
                                      });
                                    } else {
                                      const message = `Click this link to register: ${process.env.FRONTEND}/register`;
                                      res.send({
                                        status: 200,
                                        success: true,
                                        message:
                                          "An email is sent to the admin... please register here...",
                                        company_id: companyId,
                                        user_id: user._id,
                                      });
                                      await sendEmail(
                                        req.body.email,
                                        "User Registration",
                                        message
                                      );
                                    }
                                  });
                                }
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
          }
        );
      }
    });
  } catch (err) {
    console.log("ERROR: " + err.message);
    res.send({
      status: 500,
      success: false,
      message: err.message,
    });
  }
};

exports.verifyEmail = (req, res) => {
  try {
    User.findOne({ _id: req.params.id }).exec((err, user) => {
      if (err) {
        res.send({
          status: 500,
          success: false,
          message: err.message,
        });
      } else if (!user) {
        res.send({
          status: 400,
          success: false,
          message: "USER DOES NOT EXIST!",
        });
      } else {
        Token.findOne({ userId: user._id, token: req.params.token }).exec(
          (err, token) => {
            if (err) {
              res.send({
                status: 500,
                success: false,
                message: err.message,
              });
            } else if (!token) {
              res.send({
                status: 400,
                success: false,
                message: "INVALID REQUEST - TOKEN DOES NOT EXIST!",
              });
            } else {
              User.updateOne({ _id: user._id }, { verified: true }).exec(
                (err, user) => {
                  if (err) {
                    res.send({
                      status: 500,
                      success: false,
                      message: err.message,
                    });
                  } else {
                    Token.findByIdAndRemove(token._id).exec((err, token) => {
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
                          message: "EMAIL IS SUCCESSFULLY VERIFIED!",
                        });
                      }
                    });
                  }
                }
              );
            }
          }
        );
      }
    });
  } catch (err) {
    console.log("ERROR: " + err.message);
  }
};

exports.editCustomer = (req, res) => {
  try {
    const company_id = req.params.id;
    Customer.findById({ _id: req.params.id }).exec((err, customer) => {
      if (err) {
        res.send({
          status: 500,
          success: false,
          message: err.message,
        });
      } else {
        const updatedCustomerObj = {
          title: req.body.title == "" ? customer.title : req.body.title,
          website: req.body.website == "" ? customer.website : req.body.website,
        };
        Customer.updateOne({ _id: company_id }, updatedCustomerObj, {
          upsert: true,
        }).exec((err, customer) => {
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
              message: "CUSTOMER'S DETAILS ARE SUCCESSFULLY UPDATED",
            });
          }
        });
      }
    });
  } catch (err) {
    console.log("ERROR: " + err.message);
  }
};

exports.updateCustomerStatus = (req, res) => {
  try {
    const company_id = req.params.id;
    const updatedStatus = req.body.status;

    Customer.updateOne({ _id: company_id }, { status: updatedStatus }).exec(
      (err, customer) => {
        if (err) {
          res.send({
            status: 500,
            success: false,
            message: err.message,
          });
        } else {
          User.updateMany(
            { company_id: company_id },
            { status: updatedStatus }
          ).exec((err, updatedUsers) => {
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
                message: "STATUS IS SUCCESSFULLY UPDATED!",
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

exports.deleteCustomer = (req, res) => {
  try {
    Customer.findByIdAndDelete({ _id: req.params.id }).exec((err, customer) => {
      if (err) {
        res.send({
          status: 500,
          success: false,
          message: err.message,
        });
      } else {
        User.deleteMany({ company_id: customer._id }).exec((err, users) => {
          if (err) {
            res.send({
              status: 500,
              success: false,
              message: err.message,
            });
          } else {
            Complaint.deleteMany({ company_id: customer._id }).exec(
              (err, complaints) => {
                if (err) {
                  res.send({
                    status: 500,
                    success: false,
                    message: err.message,
                  });
                } else {
                  Complainee.deleteMany({ company_id: customer._id }).exec(
                    (err, complainees) => {
                      if (err) {
                        res.send({
                          status: 500,
                          success: false,
                          message: err.message,
                        });
                      } else {
                        SP.deleteMany({ company_id: customer._id }).exec(
                          (err, sps) => {
                            if (err) {
                              res.send({
                                status: 500,
                                success: false,
                                message: err.message,
                              });
                            } else {
                              Department.deleteMany({
                                company_id: customer._id,
                              }).exec((err, depts) => {
                                if (err) {
                                  res.send({
                                    status: 500,
                                    success: false,
                                    message: err.message,
                                  });
                                } else {
                                  Category.deleteMany({
                                    company_id: customer._id,
                                  }).exec((err, categories) => {
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
                                          "CUSTOMER IS SUCCESSFULLY DELETED!",
                                      });
                                    }
                                  });
                                }
                              });
                            }
                          }
                        );
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
  } catch (err) {
    console.log("ERROR: " + err.message);
  }
};

exports.addAdmin = (req, res) => {
  try {
    let salt = bcrypt.genSaltSync(10);
    const email = req.body.email;
    const company_id = req.params.id;
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
        });
      } else {
        User.create(
          {
            name: "N/A",
            email: email,
            password: bcrypt.hashSync("admin", salt),
            role: "ADMIN",
            sign_type: "PLATFORM",
            company_id: company_id,
            status: "UNREGISTERED",
          },
          (err, user) => {
            if (err) {
              res.send({
                status: 500,
                success: false,
                message: err.message,
              });
            } else {
              Customer.updateOne(
                { _id: company_id },
                { $push: { employees: { email: email, _id: user._id } } }
              ).exec(async (err, customer) => {
                if (err) {
                  res.send({
                    status: 500,
                    success: false,
                    message: err.message,
                  });
                } else {
                  const message = `Click this link to register: ${process.env.FRONTEND}/register`;
                  res.send({
                    status: 200,
                    success: true,
                    message:
                      "An email is sent to the admin... please register here...",
                    company_id: company_id,
                    user_id: user._id,
                  });
                  await sendEmail(req.body.email, "User Registration", message);
                }
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

exports.deleteAdmin = (req, res) => {
  try {
    const adminID = req.params.id;
    User.findByIdAndDelete({ _id: adminID }).exec((err, user) => {
      if (err) {
        res.send({
          status: 500,
          success: false,
          message: err.message,
        });
      } else {
        Customer.updateOne(
          { _id: user.company_id },
          { $pull: { employees: { _id: user._id } } }
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
              message: "ADMIN IS SUCCESSFULLY DELETED!",
            });
          }
        });
      }
    });
  } catch (err) {
    console.log("ERROR: " + err.message);
  }
};

exports.addCustomerType = (req, res) => {
  try {
    CustomerType.create(
      {
        title: req.body.title,
      },
      (err, customerType) => {
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
            message: "CUSTOMER TYPE ADDED",
          });
        }
      }
    );
  } catch (err) {
    console.log("ERROR:" + err.message);
  }
};

exports.getCustomerTypes = (req, res) => {
  try {
    CustomerType.find({}).exec((err, customerTypes) => {
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
          customerTypes: customerTypes,
        });
      }
    });
  } catch (err) {
    console.log("ERROR:" + err.message);
  }
};
