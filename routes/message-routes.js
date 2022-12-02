// IMPORTED THE REQUIRED PACKAGE(S)
const { express } = require("../utils/packages");

// ROUTER
const messageRouter = express.Router();

// CONTROLLERS
const messageController = require("../controllers/messageController");

/*
=============================================================================
|                                   ROUTES                                  |
=============================================================================
*/

// add/post/send message
messageRouter.post("/send/message", messageController.sendMessage);

// get message
messageRouter.get("/get/message/:id", messageController.getMessage);

module.exports = messageRouter;
