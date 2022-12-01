const { amqp, dotenv } = require("./packages");
dotenv.config();

// UTILITY/HELPER FUNCTION
const sendEmail = require("../utils/email");

// name of the queue
const queue = "email-queue";

// STEP-01: connecting to the RabbitMQ server
const open = amqp.connect(process.env.AMQP_SERVER);

// publisher
// responsible for adding our emails to the queue using the sendToQueue method
// to set up a task queue. It adds our message to the 'email-queue' queue.
const publishMessage = (payload) =>
  open
    .then((connection) => connection.createChannel()) // STEP-02: Create a channel
    .then((channel) =>
      // channe.assertQueue will create a queue if there is no queue in the server
      channel
        .assertQueue(queue, { durable: false }) // STEP-03: Assert the queue
        .then(() =>
          // STEP-04: Send the message to the queue
          channel.sendToQueue(queue, Buffer.from(JSON.stringify(payload)))
        )
    )
    .catch((error) => console.warn(error));

// Consumer/Subscriber
// this function starts up our worker in the background to listen for incoming
// messages added to our 'email-queue' queue.
const consumeMessage = () => {
  // STEP-01: Connect to the RabbitMQ server
  open
    .then((connection) => connection.createChannel()) // STEP-02: Create a channel
    .then((channel) =>
      channel.assertQueue(queue).then(() => {
        // STEP-03: Assert the queue
        console.log(
          " [*] Waiting for messages in %s. To exit press CTRL+C",
          queue
        );
        // STEP-04: Receive messages
        channel.consume(queue, (msg) => {
          console.log(msg);
          if (msg !== null) {
            const { mail, subject, template } = JSON.parse(
              msg.content.toString()
            );
            console.log(" [x] Received %s", mail);
            sendEmail(mail, subject, template).then(() => {
              channel.ack(msg); // deleting the element from the queue
            });
          }
        });
      })
    )
    .catch((error) => console.warn(error));
};

module.exports = {
  publishMessage,
  consumeMessage,
};
