// IMPORTED REQUIRED PACKAGES
const { RedisQueue, path, dotenv } = require("./packages");
dotenv.config();

// creating an email-queue and redis configuration
const emailQueue = new RedisQueue("email-queue", {
  redis: {
    port: process.env.REDIS_PORT,
    host: process.env.REDIS_URL,
  },
});

const addUsersToQueue = (users) => {
  try {
    users.forEach((user, index) =>
      emailQueue.add({ user }).then(() => {
        if (index + 1 === users.length) {
          emailQueue.process(path.join(__dirname, "process-queue.js"));
          emailQueue.on("completed", (job) => {
            console.log(`Completed #${job.id} job`);
          });
        }
      })
    );
  } catch (err) {
    console.error("ERROR: " + err.message);
    res.send({
      status: 404,
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  addUsersToQueue,
};
