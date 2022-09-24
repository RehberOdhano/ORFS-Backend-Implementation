const nodemailer = require("nodemailer");

const sendEmail = async (email, subject, text) => {
  try {
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

    transporter.verify(async (err) => {
      if (err) {
        res.send({
          status: 500,
          success: false,
          message: err.message,
        });
      } else {
        await transporter.sendMail(mailOptions);
      }
    });
  } catch (err) {
    console.log("ERROR: " + err.message);
  }
};

module.exports = sendEmail;
