const mongoose = require("mongoose");

const category_schema = mongoose.Schema(
  {
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
<<<<<<< HEAD
      ref: "Customer",
=======
      ref: "Customer"
>>>>>>> 7fb886ded24ba9e27b31ab9887b71e71ea63da73
    },
    title: {
      type: String,
      required: true,
    },
    assignedDepartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
  },
  { versionKey: false }
);

module.exports = mongoose.model("Category", category_schema);
