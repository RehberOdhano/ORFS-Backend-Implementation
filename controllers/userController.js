// IMPORTED REQUIRED PACKAGES
const mongoose = require("../utils/packages");

// MODELS
const Complaint = require("../models/complaint");
const Complainee = require("../models/complainee");
const Department = require("../models/department");
const SP = require("../models/serviceProvider");
const Category = require("../models/category");

/*
=============================================================================
|                             USERS' ROUTES                                 |
=============================================================================
*/

exports.getAllComplaints = (req, res) => {
  try {
    const id = req.params.id;
    Complaint.find({ user_id: id })
      .populate("category")
      .exec((err, complaints) => {
        if (err) {
          res.send({
            status: 500,
            success: false,
            message: err.message,
          });
        } else if (complaints == null || !complaints.length) {
          res.send({
            status: 200,
            success: true,
            message: "NO COMPLAINT IS FILED YET!",
          });
        } else {
          res.send({
            status: 200,
            success: true,
            message: "COMPLAINTS ARE SUCCESSFULLY FETCHED!",
            complaints: complaints,
          });
        }
      });
  } catch (err) {
    console.log("ERROR: " + err.message);
  }
};

// HELPER FUNCTION FOR "fileNewComplaint"
const complaintAssignment = (category_id, complaint_id) => {
  try {
    var error = false;
    if (category_id !== 0) {
      Category.findById({ _id: category_id }).exec((err, category) => {
        // if category is found and it's property assignedDepartment isn't null,
        // then based on that assignedDepartment, we'll find the serviceproviders...
        if (!err && category && category.assignedDepartment !== null) {
          Department.findById({ _id: category.assignedDepartment })
            .populate("employees")
            // sorting the serviceproviders in ascending order based on the assigned
            // complaints and in descending order based on the ratings...
            .sort({ assignedComplaints: 1, averageRating: -1 })
            .exec((err, serviceproviders) => {
              if (!err) {
                console.log(serviceproviders);
                const employees = serviceproviders["employees"];
                console.log(employees);
                // assigning the complaint to the serviceprovider who has less number of
                // assignedComplaints and has highest rating...
                Complaint.updateOne(
                  { _id: complaint_id },
                  { assignedTo: employees[0]._id }
                ).exec((err, complaint) => {
                  if (!err) {
                    SP.updateOne(
                      { _id: employees[0]._id },
                      { $push: { assignedComplaints: { _id: complaint_id } } }
                    ).exec();
                  } else error = true;
                });
              } else error = true;
            });
        } else error = true;
      });
    } else {
      return;
    }
  } catch (err) {
    console.log("ERROR: " + err.message);
  }
};

exports.fileNewComplaint = (req, res) => {
  try {
    const complaintObj = {
      company_id: req.params.id,
      complainee_id: req.body.user_id,
      title: req.body.title,
      description: req.body.description,
      category: req.body.category_id,
      priority: req.body.priority,
      // media: req.body.media,
      status: "UNASSIGNED",
      dateCreated: new Date(),
    };

    // creating a complaint...
    Complaint.create(complaintObj, (err, complaint) => {
      if (err) {
        res.send({
          status: 500,
          success: false,
          message: err.message,
        });
      } else {
        Complainee.updateOne(
          { _id: req.body.user_id },
          { $push: { complaints: { _id: complaint._id } } }
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
              message: "COMPLAINT IS CREATED SUCCESSFULLY!",
            });
            complaintAssignment(req.body.category_id, complaint._id);
          }
        });
      }
    });
  } catch (err) {
    console.log("ERROR: " + err.message);
  }
};

exports.updateComplaint = (req, res) => {
  try {
    const title = req.body.title;
    const description = req.body.description;
    const category = req.body.category;
    const date_created = req.body.date;
    const status = req.body.status;

    Complaint.updateOne(
      { _id: req.params.id },
      {
        title: title,
        description: description,
        category: category,
        dateCreated: date_created,
        status: status,
      },
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
            message: "COMPLAINT IS SUCCESSFULLY UPDATED",
          });
        }
      }
    );
  } catch (err) {
    console.log("ERROR: " + err.message);
  }
};

exports.deleteComplaint = (req, res) => {
  try {
    Complaint.deleteOne(req.params.id).exec((err, result) => {
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
    console.log("ERROR: " + err.message);
  }
};
