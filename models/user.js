const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "NAME IS REQUIRED!"],
    },
    email: {
      type: String,
      required: [true, "EMAIL IS REQUIRED!"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "PASSWORD IS REQUIRED!"],
      min: [5, "MINIMUM 5 CHARACTERS ARE REQUIRED!"],
    },
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },
    googleID: {
      type: String,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      required: [true, "USER STATUS IS REQUIRED!"],
      enum: ["ACTIVE", "UNREGISTERED"],
    },
    signin_type: {
      type: String,
    },
    role: {
      type: String,
      required: [true, "USER ROLE IS REQUIRED!"],
      enum: ["SUPERADMIN", "ADMIN", "COMPLAINEE", "SERVICEPROVIDER"],
    },
    pfp: {
      type: String,
    },
  },
  { versionKey: false }
);

module.exports = mongoose.model("User", userSchema);
