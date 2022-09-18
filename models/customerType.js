const mongoose = require("mongoose");

const customertypeSchema = mongoose.Schema(
    {
        title: {
            type: String,
            unique: true,
            required: [true, 'TITLE IS REQUIRED']
        }
    }, { versionKey: false }
);

module.exports = mongoose.model("CustomerType", customertypeSchema);