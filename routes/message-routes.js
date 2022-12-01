// IMPORTED THE REQUIRED PACKAGE(S)
const { express } = require("../utils/packages");

// ROUTER
const message_router = express.Router();

// CONTROLLERS
const messageController = require("../controllers/messageController");

/*
=============================================================================
|                                   ROUTES                                  |
=============================================================================
*/

// add/post/send message
message_router.post("/send/message", messageController.sendMessage);

// get message
message_router.get("/get/message/:id", messageController.getMessage);

module.exports = message_router;
