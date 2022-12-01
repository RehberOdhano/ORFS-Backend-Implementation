// IMPORTED THE REQUIRED PACKAGE(S)
const { express } = require("../utils/packages");

// ROUTER
const conversation_router = express.Router();

// CONTROLLERS
const conversationController = require("../controllers/conversationController");

/*
=============================================================================
|                                   ROUTES                                  |
=============================================================================
*/

// create new conversation
conversation_router.post(
  "/create/conversation",
  conversationController.createNewConversation
);

// get conversation of a user
conversation_router.get(
  "/get/conversation/:id",
  conversationController.getConversation
);

module.exports = conversation_router;
