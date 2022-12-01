// MODELS
const Conversation = require("../models/conversation");

exports.createNewConversation = async (req, res) => {
  try {
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
    Conversation.findOne({ memebers: { $in: [id] } }).exec(
      (err, conversation) => {
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
