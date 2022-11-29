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
    SP.find({ _id: id })
      .select("assignedComplaints")
      // .populate([
      //   {
      //     path: "assignedComplaints",
      //     populate: {
      //       path: "assignedTo",
      //       model: "Complaint",
      //     },
      //   },
      // ])
      .exec((err, result) => {
        if (err) {
          res.send({
            status: 500,
            success: false,
            message: err.message,
          });
        } else {
          const complaintIDs = result[0].assignedComplaints;
          Complaint.find({ _id: { $in: complaintIDs } })
            // .populate([
            //   {
            //     path: "complainee_id",
            //     populate: {
            //       path: "user_id",
            //       model: "Complainee",
            //     },
            //   },
            // ])
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
        }
      });
  } catch (err) {
    console.log("ERROR: ", err.message);
  }
};

exports.updateComplaint = (req, res) => {
  try {
    const status = req.body.status;
    const workUpdate = req.body.workUpdate;
    const id = req.params.id;
    Complaint.updateOne(
      { _id: id },
      { status: status, workUpdate: workUpdate }
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
    const spID = req.params.spID;
    const complaintID = req.params.ID;
    const status = req.body.status;
    const query = { _id: spID, assignedComplaints: { _id: complaintID } };
    SP.findOneAndUpdate(query, { status: status }).exec((err, sp) => {
      if (err) {
        res.send({
          status: 500,
          success: false,
          message: err.message,
        });
      } else {
        Complaint.findOneAndUpdate(
          { _id: complaintID },
          { status: status }
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

    SP.findOne({ _id: sp2_ID }).exec((err, sp) => {
      if (err) {
        res.send({
          status: 500,
          success: false,
          message: err.message,
        });
      } else {
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
                  { $pull: { assignedTo: { _id: sp1_ID } } }
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
                        const userID = sp.user_id;
                        User.findOne({ _id: userID }, (err, user) => {
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
                              message: `COMPLAINT IS SUCCESSFULLY TRANSFERRED TO ${user.name}!`,
                            });
                          }
                        });
                      }
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
