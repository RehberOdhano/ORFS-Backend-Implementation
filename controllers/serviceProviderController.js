// IMPORTED REQUIRED PACKAGES
const mongoose = require("../utils/packages");

// MODELS
const SP = require("../models/serviceProvider");
const Complaint = require("../models/complaint");

/*
=============================================================================
|                         SERVICEPROVIDERS'' ROUTES                         |
=============================================================================
*/

exports.getSpecificSP = (req, res) => {
  try {
    const id = req.params.id;
    SP.findOne({ user_id: id }).exec((err, sp) => {
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
          message: "SERVICEPROVIDER IS SUCCESSFULLY FETCHED!",
          serviceprovider: sp,
        });
      }
    });
  } catch (err) {
    console.log("ERROR: ", err.message);
  }
};

exports.getAssignedComplaints = (req, res) => {
  try {
    const id = req.params.id;
    SP.find({ user_id: id })
      .select("assignedComplaints")
      .exec((err, result) => {
        if (err) {
          res.send({
            status: 500,
            success: false,
            message: err.message,
          });
        } else {
          if (result.length > 0) {
            const complaintIDs = result[0].assignedComplaints;
            Complaint.find({ _id: { $in: complaintIDs } })
              .populate([
                {
                  path: "complainee_id",
                  model: "User",
                  select: ["name", "email", "role", "pfp", "status"],
                },
                "category",
                "assignHistory",
                "rating",
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
                    message: "COMPLAINTS ARE SUCCESSFULLY FETCHED!",
                    complaints: complaints,
                  });
                }
              });
          } else {
            res.send({
              status: 200,
              success: true,
              message: "ZERO COMPLAINTS ARE ASSIGNED TO THE SERVICEPROVIDER!",
            });
          }
        }
      });
  } catch (err) {
    console.log("ERROR: ", err.message);
  }
};

exports.updateComplaint = (req, res) => {
  try {
    const workUpdate = req.body.workUpdate;
    const id = req.params.id;
    Complaint.updateOne(
      { _id: id },
      { dateUpdated: Date.now(), $push: { workUpdate: workUpdate } }
    ).exec((err, complaint) => {
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
    console.log("ERROR: ", err.message);
  }
};

exports.resolveComplaint = (req, res) => {
  try {
    const spID = req.params.id;
    const complaintID = req.body.id;
    const query = { _id: spID, assignedComplaints: { _id: complaintID } };
    SP.findOneAndUpdate(query, { status: "RESOLVED" }).exec((err, sp) => {
      if (err) {
        res.send({
          status: 500,
          success: false,
          message: err.message,
        });
      } else {
        Complaint.findOneAndUpdate(
          { _id: complaintID },
          { status: "RESOLVED" }
        ).exec((err, complaint) => {
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
    console.log("ERROR: ", err.message);
  }
};

exports.transferComplaint = (req, res) => {
  try {
    const complaintID = req.params.id;
    const sp1_ID = req.body.sp1_ID;
    const sp2_ID = req.body.sp2_ID;

    SP.updateOne(
      { _id: sp1_ID },
      { $pull: { assignedComplaints: { _id: complaintID } } }
    ).exec((err, sp) => {
      if (err) {
        res.send({
          status: 500,
          success: false,
          message: err.message,
        });
      } else {
        SP.updateOne(
          { _id: sp2_ID },
          { $push: { assignedComplaints: { _id: complaintID } } }
        ).exec((err, sp) => {
          if (err) {
            res.send({
              status: 500,
              success: false,
              message: err.message,
            });
          } else {
            Complaint.updateOne(
              { _id: complaintID },
              { assignHistory: sp1_ID, $pull: { assignedTo: { _id: sp1_ID } } }
            ).exec((err, complaint) => {
              if (err) {
                res.send({
                  status: 500,
                  success: false,
                  message: err.message,
                });
              } else {
                Complaint.updateOne(
                  { _id: complaintID },
                  { $push: { assignedTo: { _id: sp2_ID } } }
                ).exec((err, complaint) => {
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
                      message: "COMPLAINT IS SUCCESSFULLY TRANSFERRED",
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
    console.log("ERROR: ", err.message);
  }
};

exports.getAvgRating = (req, res) => {
  try {
    const user_id = req.params.id;
    SP.findOne({ user_id })
      .select(["user_id", "averageRating"])
      .exec((err, rating) => {
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
            avgRating: rating,
          });
        }
      });
  } catch (err) {
    console.error("ERROR: ", err.message);
  }
};
