const mongoose = require("mongoose");

const deptSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "TITLE IS REQUIRED!"],
      min: [1, "MINIMUM 10 CHARACTERS ARE REQUIRED!"],
      max: [10, "TITLE CAN'T EXCEED 10 CHARACTERS!"],
    },
    category: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },
    employees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { versionKey: false }
);

module.exports = mongoose.model("Department", deptSchema);
