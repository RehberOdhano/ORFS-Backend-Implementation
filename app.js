// imported the required packages and routes...

// PACKAGES
const express = require("express");
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");
const path = require("path");

require("./middlewares/google-auth")(passport);

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// SESSION
app.use(
  session({
    secret: "QRFS",
    resave: false, // this means that we don't want to save the session if nothing is modified
    saveUninitialized: false, // this means that don't create a session until something
    // is stored
  })
);

// PASSPORT MIDDLEWARE
app.use(passport.initialize());
app.use(passport.session());

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
