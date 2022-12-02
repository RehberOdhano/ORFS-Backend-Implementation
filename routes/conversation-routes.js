// IMPORTED THE REQUIRED PACKAGE(S)
const { express } = require("../utils/packages");

// ROUTER
const conversationRouter = express.Router();

// CONTROLLERS
const conversationController = require("../controllers/conversationController");

/*
=============================================================================
|                                   ROUTES                                  |
=============================================================================
*/

// create new conversation
conversationRouter.post(
  "/create/conversation",
  conversationController.createNewConversation
);

// get conversation of a user
conversationRouter.get(
  "/get/conversation/:id",
  conversationController.getConversation
);

module.exports = conversationRouter;
