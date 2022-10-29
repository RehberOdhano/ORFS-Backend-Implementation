// imported the required packages and routes...
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
const io = socket(server);

// SOCKET SERVER INITIATE
io.on("connection", (socket) => {
    console.log('New client connected');
    interval = setInterval(() => testFunction(socket), 1000);
    socket.on("discconect", () => {
        console.log("Client disconnected");
    })
})

const testFunction = socket => {
    const response = "TESTING NEW CONNECTION";
    socket.emit("Test", response)
}

// SERVER LISTENING TO SOCKET PORT
// const socketPort = 4040;
// server.listen(socketPort, () =>
//   console.log(`SOCKETS ARE LISTENING ON PORT: ${socketPort}`)
// );

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

app.use("/", auth_routes);
// app.use('/admin', passport.authenticate('jwt', {session: false}) , admin_routes);
app.use("/admin", admin_routes);
app.use("/superadmin", superadmin_routes);
app.use("/user", user_routes);
app.use("/serviceprovider", service_provider_routes);
app.use("/analytics", analytics_routes);
app.use("/api", misc_routes);

module.exports = app;
