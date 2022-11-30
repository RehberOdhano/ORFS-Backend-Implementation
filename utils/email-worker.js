const { amqp, dotenv } = require("./packages");
dotenv.config();

// UTILITY/HELPER FUNCTION
const sendEmail = require("../utils/email");

// name of the queue
const queue = "email-queue";

// connecting to the RabbitMQ server
const open = amqp.connect(process.env.AMQP_SERVER);

// publisher
// responsible for adding our emails to the queue using the sendToQueue method
// to set up a task queue. It adds our message to the 'email-queue' queue.
const publishMessage = (payload) =>
  open
    .then((connection) => connection.createChannel())
    .then((channel) =>
      // channe.assertQueue will create a queue if there is no queue in the server
      channel
        .assertQueue(queue, { durable: false })
        .then(() =>
          channel.sendToQueue(queue, Buffer.from(JSON.stringify(payload)))
        )
    )
    .catch((error) => console.warn(error));

// Consumer/Subscriber
// this function starts up our worker in the background to listen for incoming
// messages added to our 'email-queue' queue.
const consumeMessage = () => {
  open
    .then((connection) => connection.createChannel())
    .then((channel) =>
      channel.assertQueue(queue).then(() => {
        console.log(
          " [*] Waiting for messages in %s. To exit press CTRL+C",
          queue
        );
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
