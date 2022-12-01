// MODELS
const Message = require("../models/message");

exports.sendMessage = async (req, res) => {
  try {
    const newMessage = new Message(req.body);
    const savedMessage = await newMessage.save();
    res.send({
      status: 200,
      success: true,
      message: "MESSAGE IS SUCCESSFULLY SENT!",
      chatMessage: savedMessage,
    });
  } catch (err) {
    console.error("ERROR: " + err.message);
    res.send({
      status: 500,
      success: false,
      message: err.message,
    });
  }
};

exports.getMessage = (req, res) => {
  try {
    const conversationId = req.params.id;
    Message.findOne({ conversation_id: conversationId }).exec(
      (err, message) => {
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
            message: message,
          });
        }
      }
    );
  } catch (err) {
    console.error("ERROR: " + err.message);
    res.send({
      status: 500,
      success: false,
      message: err.message,
    });
  }
};
