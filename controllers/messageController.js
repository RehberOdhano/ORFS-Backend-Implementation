// MODELS
const Message = require("../models/message");

exports.sendMessage = async (req, res) => {
  try {
    const { senderId, text, conversationId } = req.body;
    Message.create(
      {
        conversation_id: conversationId,
        sender: senderId,
        message: text,
      },
      (err, savedMessage) => {
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
            message: "MESSAGE IS SUCCESSFULLY SENT!",
            chatMessage: savedMessage,
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

exports.getMessage = (req, res) => {
  try {
    const conversationId = req.params.id;
    Message.find({ conversation_id: conversationId }).exec((err, message) => {
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
