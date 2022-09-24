// PACKAGES
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const mongoose = require("mongoose");

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

exports.getAllCustomers = (req, res) => {
  try {
    // getting all the registered customers
    Customer.find({}).exec((err, customers) => {
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
          status: 500,
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
            // dateRegistered: new Date().toLocaleString("en-GB"), // date in dd/mm/yyyy format
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
              const company_id = customer._id;
              User.findOne({
                $and: [{ email: req.body.email }, { verified: true }],
              }).exec((err, user) => {
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
                    message: `USER WITH THIS EMAIL ${user.email} ALREADY EXISTS & HAS VERIFIED HIS/HER ACCOUNT!`,
                  });
                } else {
                  Customer.updateOne(
                    { website: req.body.website },
                    { $push: { employees: { email: req.body.email } } }
                  ).exec((err, customer) => {
                    if (err) {
                      res.send({
                        status: 500,
                        success: false,
                        message: err.message,
                      });
                    } else {
                      const query = { email: req.body.email },
                        update = { email: req.body.email, role: "ADMIN" },
                        options = { new: true, upsert: true };
                      User.findOneAndUpdate(query, update, options).exec(
                        (err, user) => {
                          if (err) {
                            res.send({
                              status: 500,
                              success: false,
                              message: err.message,
                            });
                          } else {
                            Token.create(
                              {
                                userId: user._id,
                                token: crypto.randomBytes(32).toString("hex"),
                              },
                              async (err, token) => {
                                if (err) {
                                  res.send({
                                    status: 500,
                                    success: false,
                                    message: err.message,
                                  });
                                } else {
                                  const message = `${process.env.BASE_URL}/superadmin/admin/verify/${user._id}/${req.body.email}/${token.token}`;
                                  await sendEmail(
                                    req.body.email,
                                    "Verify Email",
                                    message
                                  );
                                  res.send({
                                    status: 200,
                                    success: true,
                                    message:
                                      "An email is sent to the admin... please verify...",
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
          email: req.body.email == "" ? customer.email : req.body.email,
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
    User.create(
      {
        name: "UNDEFINED",
        email: email,
        password: bcrypt.hashSync("admin", salt),
        role: "ADMIN",
        sign_type: "PLATFORM",
        company_id: company_id,
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
                message: "ADMIN IS SUCCESSFULLY ADDED!",
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
