// MODELS
const Complaint = require("../models/complaint");
const Complainee = require("../models/complainee");
const Department = require("../models/department");
const SP = require("../models/serviceProvider");
const Category = require("../models/category");
const Rating = require("../models/rating");

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
      .populate({
        path: "assignedTo",
        populate: {
          path: "user_id",
          model: "User",
        },
      })
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
            complaints: [],
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
            .exec((err, serviceproviders) => {
              if (!err) {
                // console.log(serviceproviders);
                var employees = serviceproviders["employees"];
                // sorting the serviceproviders in ascending order based on the assigned
                // complaints and in descending order based on the ratings...
                // employees.sort((emp1, emp2) => {
                //   console.log("employees");
                //   console.log(emp1.assignedComplaints, emp2.assignedComplaints);
                //   return (
                //     emp1.assignedComplaints.length >
                //     emp2.assignedComplaints.length
                //   );
                // });
                var tempObj;
                for (var i = 0; i < employees.length; i++) {
                  for (var j = i + 1; j < employees.length; j++) {
                    if (
                      employees[i].assignedComplaints.length >
                      employees[j].assignedComplaints.length
                    ) {
                      tempObj = employees[i];
                      employees[i] = employees[j];
                      employees[j] = tempObj;
                    }
                  }
                }
                employees.sort((emp1, emp2) => {
                  return emp1.averageRating < emp2.averageRating;
                });
                // console.log(employees);

                // assigning the complaint to the serviceprovider who has less number of
                // assignedComplaints and has highest rating...
                Complaint.updateOne(
                  { _id: complaint_id },
                  {
                    assignedTo: employees[0]._id,
                    assignHistory: employees[0]._id,
                    status: "ASSIGNED",
                  }
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
      complainee_id: req.body._id,
      title: req.body.title,
      description: req.body.description,
      category: req.body.category_id,
      priority: req.body.priority,
      media: req.body.media,
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
          { user_id: req.body.user_id },
          { $push: { complaints: complaint._id } }
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

exports.submitRating = (req, res) => {
  try {
    const complaintID = req.params.id;
    const company_id = req.body.company_id;
    const spID = req.body.spID;
    const complainee_user_id = req.body.user_id;
    const rating_level = req.body.rating_level;
    const review = req.body.review;

    Rating.create(
      {
        company_id: company_id,
        complainee_id: complainee_user_id,
        serviceprovider_id: spID,
        complaint_id: complaintID,
        rating_level: rating_level,
        review: review,
      },
      (err, rating) => {
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
            message: "RATING & FEEDBACK ARE SUCCESSFULLY SUBMITTED!",
          });
        }
      }
    );
  } catch (err) {
    console.error("ERROR: " + err.message);
  }
};

// exports.updateComplaint = (req, res) => {
//   try {
//     const title = req.body.title;
//     const description = req.body.description;
//     const category = req.body.category;
//     const date_created = req.body.date;
//     const status = req.body.status;

//     Complaint.updateOne(
//       { _id: req.params.id },
//       {
//         title: title,
//         description: description,
//         category: category,
//         dateCreated: date_created,
//         status: status,
//       },
//       (err, complaint) => {
//         if (err) {
//           res.send({
//             status: 500,
//             success: false,
//             message: err.message,
//           });
//         } else {
//           res.send({
//             status: 200,
//             success: true,
//             message: "COMPLAINT IS SUCCESSFULLY UPDATED",
//           });
//         }
//       }
//     );
//   } catch (err) {
//     console.log("ERROR: " + err.message);
//   }
// };

// exports.archiveSpecificComplaint = (req, res) => {
//   try {
//     const id = req.params.id;
//     Complaint.updateOne(id, { status: "ARCHIVED" }).exec((err, complaint) => {
//       if (err) {
//         res.send({
//           status: 500,
//           success: false,
//           message: err.message,
//         });
//       } else {
//         res.send({
//           status: 200,
//           success: true,
//           message: "COMPLAINT IS SUCCESSFULLY ARCHIVED!",
//         });
//       }
//     });
//   } catch (err) {
//     console.log("ERROR: " + err.message);
//   }
// };

// exports.getArchivedComplaints = (req, res) => {
//   try {
//     Complainee.find(req.params.id).exec((err, archivedComplaints) => {
//       if (err) {
//         res.send({
//           status: 500,
//           success: false,
//           message: err.message,
//         });
//       } else {
//         res.send({
//           status: 200,
//           success: true,
//           complaints: archivedComplaints,
//         });
//       }
//     });
//   } catch (err) {
//     console.error("ERROR: " + err.message);
//   }
// };

// exports.deleteComplaint = (req, res) => {
//   try {
//     Complaint.findByIdAndDelete(req.params.id).exec((err, deletedComplaint) => {
//       if (err) {
//         res.send({
//           status: 500,
//           success: false,
//           message: err.message,
//         });
//       } else {
//         Complainee.updateOne(
//           { company_id: deletedComplaint.company_id },
//           { $pull: { complaints: req.params.id } }
//         ).exec((err, updatedComplainee) => {
//           if (err) {
//             res.send({
//               status: 500,
//               success: false,
//               message: err.message,
//             });
//           } else {
//             if (deletedComplaint.assignedTo) {
//               SP.updateOne(
//                 { _id: deletedComplaint.assignedTo },
//                 { $pull: { assignedComplaints: req.params.id } }
//               ).exec((err, updatedSP) => {
//                 if (err) {
//                   res.send({
//                     status: 500,
//                     success: false,
//                     message: err.message,
//                   });
//                 } else {
//                   res.send({
//                     status: 200,
//                     success: true,
//                     message: "COMPLAINT IS SUCCESSFULLY DELETED!",
//                   });
//                 }
//               });
//             } else {
//               res.send({
//                 status: 200,
//                 success: true,
//                 message: "COMPLAINT IS SUCCESSFULLY DELETED!",
//               });
//             }
//           }
//         });
//       }
//     });
//   } catch (err) {
//     console.log("ERROR: " + err.message);
//   }
// };
