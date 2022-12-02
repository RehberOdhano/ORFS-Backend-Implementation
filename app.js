// imported the required packages
const { express, cors, passport, path } = require("./utils/packages");

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
  socket.on(
    "sendMessage",
    ({ conversation_id, senderId, receiverId, text }) => {
      const user = getUser(receiverId);
      console.log(users);
      io.to(user.socketId).emit("getMessage", {
        senderId,
        text,
        conversation_id,
      });
    }
  );

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
const authRoutes = require("./routes/auth-routes");
const adminRoutes = require("./routes/admin-routes");
const superAdminRoutes = require("./routes/superadmin-routes");
const userRoutes = require("./routes/user-routes");
const serviceProviderRoutes = require("./routes/service-provider-routes");
const analyticsRoutes = require("./routes/analytics-routes");
const miscRoutes = require("./routes/misc-routes");
const conversationRoutes = require("./routes/conversation-routes");
const messageRoutes = require("./routes/message-routes");
const paymentRoutes = require("./routes/payment-routes");

app.use("/", authRoutes);
// app.use('/admin', passport.authenticate('jwt', {session: false}) , adminRoutes);
app.use("/admin", adminRoutes);
app.use("/superadmin", superAdminRoutes);
app.use("/user", userRoutes);
app.use("/serviceprovider", serviceProviderRoutes);
app.use("/analytics", analyticsRoutes);
app.use("/api", [miscRoutes, conversationRoutes, messageRoutes, paymentRoutes]);

module.exports = app;
