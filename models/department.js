const mongoose = require("mongoose");

const deptSchema = mongoose.Schema(
  {
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },
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
    employees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ServiceProvider",
      },
    ],
  },
  { versionKey: false }
);

module.exports = mongoose.model("Department", deptSchema);
