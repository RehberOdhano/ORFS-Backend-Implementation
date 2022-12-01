// imported the required packages
const {
  express,
  cors,
  passport,
  path,
  http,
  socket,
} = require("./utils/packages");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// PASSPORT MIDDLEWARE
app.use(passport.initialize());

// SOCKET IMPORTS
const socket = require("socket.io");
const http = require("http");

const server = http.createServer(app);
const io = socket(server, { cors: { origin: "*" } });

let users = [];

// HELPER FUNCTIONS
const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};

// SOCKET SERVER INITIATE - when user connects
io.on("connection", (socket) => {
  console.log("New client connected");

  // take userId and socketId from the user
  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    io.emit("getUsers", users);
  });

  // send & get message
  socket.on("sendMessage", ({ senderId, receiverId, text }) => {
    const user = getUser(receiverId);
    io.to(user.socketId).emit("getMessage", {
      senderId,
      text,
    });
  });

  // when user disconnects
  socket.on("disconnect", () => {
    console.log("Client disconnected");
    removeUser(socket.id);
    io.emit("getUsers", users);
  });
});

// SERVER LISTENING TO SOCKET PORT
const socketPort = 4040;
server.listen(socketPort, () =>
  console.log(`SOCKETS ARE LISTENING ON PORT: ${socketPort}`)
);

// STATIC FOLDER
app.use("/public", express.static(path.join(__dirname, "public")));

// ROUTES
const auth_routes = require("./routes/auth-routes");
const admin_routes = require("./routes/admin-routes");
const superadmin_routes = require("./routes/superadmin-routes");
const user_routes = require("./routes/user-routes");
const service_provider_routes = require("./routes/service-provider-routes");
const analytics_routes = require("./routes/analytics-routes");
const misc_routes = require("./routes/misc-routes");
const conversation_routes = require("./routes/conversation-routes");
const message_routes = require("./routes/message-routes");

app.use("/", auth_routes);
// app.use('/admin', passport.authenticate('jwt', {session: false}) , admin_routes);
app.use("/admin", admin_routes);
app.use("/superadmin", superadmin_routes);
app.use("/user", user_routes);
app.use("/serviceprovider", service_provider_routes);
app.use("/analytics", analytics_routes);
app.use("/api", [misc_routes, conversation_routes, message_routes]);

module.exports = app;
