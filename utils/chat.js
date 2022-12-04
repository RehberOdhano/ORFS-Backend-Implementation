// // SOCKET IMPORTS
// const socket = require("socket.io");
// const http = require("http");

// const server = http.createServer(app);
// const io = socket(server, { cors: { origin: "*" } });

// let users = [];

// // HELPER FUNCTIONS
// const addUser = (userId, socketId) => {
//   !users.some((user) => user.userId === userId) &&
//     users.push({ userId, socketId });
// };

// const removeUser = (socketId) => {
//   users = users.filter((user) => user.socketId !== socketId);
// };

// const getUser = (userId) => {
//   return users.find((user) => user.userId === userId);
// };

// // SOCKET SERVER INITIATE - when user connects
// io.on("connection", (socket) => {
//   console.log("New client connected");

//   // take userId and socketId from the user
//   socket.on("addUser", (userId) => {
//     addUser(userId, socket.id);
//     io.emit("getUsers", users);
//   });

//   // send & get message
//   socket.on(
//     "sendMessage",
//     ({ conversation_id, senderId, receiverId, text }) => {
//       const user = getUser(receiverId);
//       console.log(users);
//       if (user) {
//         io.to(user.socketId).emit("getMessage", {
//           senderId,
//           text,
//           conversation_id,
//         });
//       }
//     }
//   );

//   // when user disconnects
//   socket.on("disconnect", () => {
//     console.log("Client disconnected");
//     removeUser(socket.id);
//     io.emit("getUsers", users);
//   });
// });

// // SERVER LISTENING TO SOCKET PORT
// const socketPort = 4040;
// server.listen(socketPort, () =>
//   console.log(`SOCKETS ARE LISTENING ON PORT: ${socketPort}`)
// );
