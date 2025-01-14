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
      .populate([
        {
          path: "assignedTo",
          populate: {
            path: "user_id",
            model: "User",
          },
        },
        "category",
        "rating",
      ])
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
                // 1. sorting the employees based on number of assigned complaints
                // sortinh using bubble sort... will use more efficient algorithm later... :)
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
                // 2. sorting the employees based on the average rating
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
      // Here ML will come into play...
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
    const complaintId = req.params.id;
    const companyId = req.body.company_id;
    const spId = req.body.spID;
    const complaineeUserId = req.body.user_id;
    const ratingLevel = req.body.rating_level;
    const review = req.body.review;

    Complaint.findOne({ _id: complaintId }).exec((err, complaint) => {
      if (err) {
        res.send({
          status: 500,
          success: false,
          message: err.message,
        });
      } else if (complaint.rating) {
        res.send({
          status: 201,
          success: true,
          message: "RATING IS ALREADY GIVEN!",
        });
      } else if (complaint.status != "RESOLVED") {
        res.send({
          status: 202,
          success: true,
          message: "RATING NOT ALLOWED!",
        });
      } else {
        Rating.create(
          {
            company_id: companyId,
            complainee_id: complaineeUserId,
            serviceprovider_id: spId,
            complaint_id: complaintId,
            rating_level: ratingLevel,
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
              Complaint.updateOne(
                { _id: complaintId },
                { rating: rating._id }
              ).exec(async (err, complaint) => {
                if (err) {
                  res.send({
                    status: 500,
                    success: false,
                    message: err.message,
                  });
                } else {
                  // const avgRating = await SP.aggregate([
                  //   { $match: { _id: spId } },
                  //   {
                  //     $reduce: {
                  //       input: "ratings",
                  //       initialValue: 0,
                  //       in: { $add: ["$$value.sum", "$$this"] },
                  //     },
                  //   },
                  // ]);
                  SP.findOne({ _id: spId }).exec((err, sp) => {
                    if (err) {
                      res.status(500).send({ message: err.message });
                    } else {
                      let progress = sp?.level?.progress;
                      let levelCount = sp?.level?.level_count;
                      const points = ratingLevel * 10;
                      if (progress && progress + points >= 100) {
                        levelCount++;
                        progress += points - 100;
                      } else progress += points;

                      let avgRating = ratingLevel;
                      if (sp.ratings.length > 0) {
                        sp.ratings.forEach(
                          (rating) => (avgRating += rating.rating_level)
                        );
                        avgRating /= sp.ratings.length + 1;
                      }

                      SP.updateOne(
                        { _id: spId },
                        {
                          $push: { ratings: { _id: rating._id } },
                          $set: {
                            "level.progress": progress,
                            "level.level_count": levelCount,
                          },
                          points: ratingLevel * 10,
                          averageRating: avgRating,
                        }
                      )
                        .populate("ratings")
                        .exec((err, sp) => {
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
                                "RATING & FEEDBACK ARE SUCCESSFULLY SUBMITTED!",
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
