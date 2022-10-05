const mongoose = require("mongoose");

const category_schema = mongoose.Schema(
  {
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
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
