// UTILITY/HELPER FUNCTIONS
const sendEmail = require("../utils/email");

// MODELS
const User = require("../models/user");
const Complainee = require("../models/complainee");
const SP = require("../models/serviceProvider");

const emailQueueProcessor = async (job, done) => {
  // job - each element of the queue
  // done - it's function that will be called when the job is completed
  try {
    const { role, email, company_id } = job.data.user;
    console.log(`role: ${role} email: ${email} company_id: ${company_id}`);
    const update = {
      name: "N/A",
      email: email,
      role: role,
      sign_type: "PLATFORM",
      status: "UNREGISTERED",
      company_id: company_id,
    };
    options = { new: true, upsert: true };

    User.findOne({ email: email }).exec((err, user) => {
      if (err) {
        console.error("ERROR: " + err.message);
        throw err;
      } else if (user) {
        console.log("USER ALREADY EXISTS!");
      } else {
        User.findOneAndUpdate({ email: email }, update, options).exec(
          (err, updatedUser) => {
            if (err) {
              console.error("ERROR: " + err.message);
            } else {
              Customer.updateOne(
                { _id: company_id },
                { $push: { employees: { _id: updatedUser._id } } }
              ).exec((err, user) => {
                if (err) {
                  console.error("ERROR: " + err.message);
                } else {
                  if (role === "COMPLAINEE") {
                    Complainee.create(
                      {
                        user_id: updatedUser._id,
                        company_id: company_id,
                      },
                      (err, complainee) => {
                        if (err) {
                          console.error("ERROR: " + err.message);
                        }
                      }
                    );
                  } else if (role === "SERVICEPROVIDER") {
                    SP.create(
                      {
                        user_id: updatedUser._id,
                        company_id: company_id,
                        averageRating: 0,
                      },
                      (err, sp) => {
                        if (err) {
                          console.error("ERROR: " + err.message);
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

    const message = `Click this link to register: ${process.env.FRONTEND}/register</p>`;
    await sendEmail(email, "User Registration", message);

    setTimeout(() => {
      done();
    }, 2000);
  } catch (err) {
    throw err;
  }
};

module.exports = emailQueueProcessor;
