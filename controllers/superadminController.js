// PACKAGES
const bcrypt = require("bcryptjs");

// MODELS
const Customer = require("../models/customer");
const Department = require("../models/department");
const User = require("../models/user");
const Complaint = require("../models/complaint");
const Complainee = require("../models/complainee");
const Category = require("../models/category");
const SP = require("../models/serviceProvider");

exports.getAllCustomers = (req, res) => {
  try {
    // getting all the registered customers
    Customer.find({}).exec((err, customers) => {
      if (err) {
        res.send({
          status: 404,
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
          status: 404,
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
          },
          (err, customer) => {
            if (err) {
              res.send({
                status: 404,
                success: false,
                message: err.message,
              });
            } else {
              const company_id = customer._id;
              User.findOne({ email: req.body.adminEmail }).exec((err, user) => {
                if (err) {
                  res.send({
                    status: 404,
                    success: false,
                    message: err.message,
                  });
                } else if (user) {
                  res.send({
                    status: 200,
                    success: true,
                    message: `ADMIN WITH THIS EMAIL ${user.email} IS ALREADT EXISTS!`,
                  });
                } else {
                  Customer.updateOne(
                    { email: req.body.email },
                    { $push: { employees: { email: req.body.adminEmail } } }
                  ).exec((err, customer) => {
                    if (err) {
                      res.send({
                        status: 404,
                        success: false,
                        message: err.message,
                      });
                    } else {
                      User.create(
                        {
                          name: "UNDEFINED",
                          email: req.body.adminEmail,
                          password: bcrypt.hashSync("admin", salt),
                          role: "ADMIN",
                          sign_type: "PLATFORM",
                          company_id: company_id,
                        },
                        (err, user) => {
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
                              message:
                                "CUSTOMER & ADMIN ARE SUCCESSFULLY ADDED!",
                            });
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
  }
};

exports.editCustomer = (req, res) => {
  try {
    const company_id = req.params.id;
    Customer.findById({ _id: req.params.id }).exec((err, customer) => {
      if (err) {
        res.send({
          status: 404,
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
              status: 404,
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
          status: 404,
          success: false,
          message: err.message,
        });
      } else {
        User.deleteMany({ company_id: customer._id }).exec((err, users) => {
          if (err) {
            res.send({
              status: 404,
              success: false,
              message: err.message,
            });
          } else {
            Complaint.deleteMany({ company_id: customer._id }).exec(
              (err, complaints) => {
                if (err) {
                  res.send({
                    status: 404,
                    success: false,
                    message: err.message,
                  });
                } else {
                  Complainee.deleteMany({ company_id: customer._id }).exec(
                    (err, complainees) => {
                      if (err) {
                        res.send({
                          status: 404,
                          success: false,
                          message: err.message,
                        });
                      } else {
                        SP.deleteMany({ company_id: customer._id }).exec(
                          (err, sps) => {
                            if (err) {
                              res.send({
                                status: 404,
                                success: false,
                                message: err.message,
                              });
                            } else {
                              Department.deleteMany({
                                company_id: customer._id,
                              }).exec((err, depts) => {
                                if (err) {
                                  res.send({
                                    status: 404,
                                    success: false,
                                    message: err.message,
                                  });
                                } else {
                                  Category.deleteMany({
                                    company_id: customer._id,
                                  }).exec((err, categories) => {
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
            status: 404,
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
                status: 404,
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
          status: 404,
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
              status: 404,
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
