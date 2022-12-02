// IMPORTED REQUIRED PACKAGES
const { RedisQueue, dotenv } = require("./packages");
dotenv.config();

// UTILITY/HELPER FUNCTIONS
const sendEmail = require("../utils/email");

// MODELS
const User = require("../models/user");
const Complainee = require("../models/complainee");
const SP = require("../models/serviceProvider");
const Customer = require("../models/customer");

// creating an email-queue and redis configuration
const emailQueue = new RedisQueue("email-queue", {
  redis: {
    port: process.env.REDIS_PORT,
    host: process.env.REDIS_URL,
  },
});

const processTheJob = (job, done) => {
  try {
    const { company_id, role, email } = job.data.user;
    // console.log(`company_id: ${company_id}\nrole: ${role}\nemail: ${email}`);

    User.findOne({ email: email }).exec((err, user) => {
      if (err) throw err;
      else if (user) console.log("USER ALREADY EXISTS");
      else {
        const query = { email: email },
          update = {
            name: "N/A",
            email: email,
            role: role,
            sign_type: "PLATFORM",
            status: "UNREGISTERED",
            company_id: company_id,
          },
          options = { new: true, upsert: true };

        User.findOneAndUpdate(query, update, options).exec(
          async (err, updatedUser) => {
            if (err) throw err;
            else {
              // console.log(updatedUser);
              Customer.updateOne(
                { _id: company_id },
                { $push: { employees: updatedUser._id } }
              ).exec(async (err, updatedCustomer) => {
                if (err) throw err;
                else {
                  if (role === "COMPLAINEE") {
                    Complainee.create({
                      user_id: updatedUser._id,
                      company_id: company_id,
                    });
                  } else {
                    SP.create({
                      user_id: updatedUser._id,
                      company_id: company_id,
                      assignedComplaints: [],
                      averageRating: 0,
                      assignedDepartment: null,
                    });
                  }
                  const message = `Click this link to register: ${process.env.FRONTEND}/register.`;
                  await sendEmail(email, "User Registration", message);
                  setInterval(() => {
                    done();
                  }, 2000);
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

const cleanQueue = () => {
  try {
    emailQueue.on("completed", (job, isFinished) => {
      // console.log(`Completed #${job.id} job!`);
      // cleaning the queue
      if (isFinished) {
        var clean = job.queue.clean.bind(job.queue, 0);
        job.queue
          .pause()
          .then(clean("completed"))
          .then(clean("active"))
          .then(clean("delayed"))
          .then(clean("failed"))
          .then(() => {
            return job.queue.empty();
          })
          .then(() => {
            return job.queue.close();
          });
        // console.log(clean);
      }
    });
  } catch (err) {
    console.error("ERROR: " + err.message);
  }
};

const addUsersToQueue = (users) => {
  try {
    users.forEach((user, index) =>
      emailQueue
        .add({ user }, { delay: 1000 })
        .then((job) => {
          if (index + 1 === users.length) {
            // console.log("ALL EMAILS ARE SENT!");
            // console.log(job.data.user);
            emailQueue.process((job, done) => {
              processTheJob(job, done);
            });
            cleanQueue();
          }
        })
        .catch((err) => {
          console.error("ERROR: " + err.message);
        })
    );
  } catch (err) {
    console.error("ERROR: " + err.message);
  }
};

module.exports = {
  addUsersToQueue,
};
