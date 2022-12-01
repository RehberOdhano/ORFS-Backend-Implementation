// MODELS
const Conversation = require("../models/conversation");

exports.createNewConversation = (req, res) => {
  try {
    Conversation.findOne({
      memebers: { $in: [req.body.senderId, req.body.receiverId] },
    }).exec(async (err, conversation) => {
      if (err) {
        res.send({
          status: 500,
          success: false,
          message: err.message,
        });
      } else if (conversation) {
        res.send({
          status: 201,
          success: true,
          message: "CONVERSATION ALREADY EXISTS!",
        });
      } else {
        const newConversation = new Conversation({
          memebers: [req.body.senderId, req.body.receiverId],
        });

        const savedConversation = await newConversation.save();
        res.send({
          status: 200,
          success: true,
          message: "CONVERSATION IS SUCCESSFULLY CREATED!",
          conversation: savedConversation,
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

exports.getConversation = (req, res) => {
  try {
    const id = req.params.id;
    Conversation.find({ memebers: { $in: [id] } }).exec((err, conversation) => {
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
          conversation: conversation,
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
