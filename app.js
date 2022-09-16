// imported the required packages and routes...

// PACKAGES
const express = require("express");
const cors = require("cors");
const passport = require("passport");
const path = require("path");

// ROUTES
const auth_routes = require("./routes/auth-routes");
const admin_routes = require("./routes/admin-routes");
const superadmin_routes = require("./routes/superadmin-routes");
const user_routes = require("./routes/user-routes");
const service_provider_routes = require("./routes/service-provider-routes");
const analytics_routes = require("./routes/analytics-routes");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(passport.initialize());
app.use("/public", express.static(path.join(__dirname, "public")));

app.use("/", auth_routes);
// app.use('/admin', passport.authenticate('jwt', {session: false}) , admin_routes);
app.use("/admin", admin_routes);
app.use("/superadmin", superadmin_routes);
app.use("/user", user_routes);
app.use("/serviceprovider", service_provider_routes);
app.use("/analytics", analytics_routes);

module.exports = app;
