const { nodemailer } = require("./packages");

const sendEmail = (email, subject, text) => {
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    service: "gmail",
    port: process.env.MAIL_PORT,
    secure: true,
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  var mailOptions = {
    from: process.env.MAIL_FROM_ADDRESS,
    to: email,
    subject: subject,
    text: text,
  };

  // verify connection configuration
  transporter.verify(function (error, success) {
    transporter.sendMail(mailOptions, (err, info) => transporter.close());
  });
};

module.exports = sendEmail;
