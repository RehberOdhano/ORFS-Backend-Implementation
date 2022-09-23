// PACKAGES
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

// MODELS
const Customer = require("../models/customer");
const Department = require("../models/department");
const User = require("../models/user");
const Complaint = require("../models/complaint");
const Complainee = require("../models/complainee");
const Category = require("../models/category");
const SP = require("../models/serviceProvider");
const CustomerType = require("../models/customerType");

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
    let salt = bcrypt.genSaltSync(10);
    Customer.findOne({
      $or: [{ email: req.body.email }, { title: req.body.title }],
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
          message: "CUSTOMER WITH THIS EMAIL/TITLE IS ALREADY EXISTS!",
        });
      } else {
        Customer.create(
          {
            title: req.body.title,
            email: req.body.email,
            status: req.body.status,
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
              User.findOne({ email: req.body.adminEmail }).exec((err, user) => {
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
                  });
                } else {
                  Customer.updateOne(
                    { email: req.body.email },
                    { $push: { employees: { email: req.body.adminEmail } } }
                  ).exec((err, customer) => {
                    if (err) {
                      res.send({
                        status: 500,
                        success: false,
                        message: err.message,
                      });
                    } else {
                      // SENDING EMAIL TO THE ADMIN
                      var transporter = nodemailer.createTransport({
                        service: "gmail",
                        auth: {
                          user: process.env.MAIL_USERNAME,
                          pass: process.env.MAIL_PASSWORD,
                        },
                      });

                      var mailOptions = {
                        from: process.env.MAIL_FROM_ADDRESS,
                        to: req.body.adminEmail,
                        subject: "Register new admin",
                        text: `Hello there ✔... Welcome to QRFS...`,
                        html: `<a href="http://localhost:3000/register/${company_id}">Register Here</a>`,
                      };

                      // verifying the SMTP configuiration settings and if the settings
                      // are fine, then it'll send an email to the specified email
                      // address otherwise it'll send an error message as a response...
                      transporter.verify((err) => {
                        if (err) {
                          res.send({
                            status: 500,
                            success: false,
                            message: err.message,
                          });
                        } else {
                          transporter.sendMail(
                            mailOptions,
                            function (error, info) {
                              if (error) {
                                res.send({
                                  status: 500,
                                  success: false,
                                  message: error.message,
                                });
                              } else {
                                console.log(
                                  "Email sent: " + JSON.stringify(info)
                                );
                                res.send({
                                  status: 200,
                                  success: true,
                                  message:
                                    "CUSTOMER IS SUCCESSFULLY CREATED AND EMAIL IS SUCCESSFULLY SENT TO THE ADMIN!",
                                });
                              }
                            }
                          );
                        }
                      });

                      // User.create(
                      //   {
                      //     name: "UNDEFINED",
                      //     email: req.body.adminEmail,
                      //     password: bcrypt.hashSync("admin", salt),
                      //     role: "ADMIN",
                      //     sign_type: "PLATFORM",
                      //     company_id: company_id,
                      //   },
                      //   (err, user) => {
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
                      //         message:
                      //           "CUSTOMER & ADMIN ARE SUCCESSFULLY ADDED!",
                      //       });
                      //     }
                      //   }
                      // );
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
