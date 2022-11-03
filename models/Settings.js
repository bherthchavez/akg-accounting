const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    name: {
        type:  String,
        required: true,
    },
    prefix: {
        type:  String,
        required: true,
    },
    starting_no: {
        type:  String,
        required: true,
    },
    created_by: {
        type:  String,
        required: true,
    },
    updated_at: {
        type:  Date,
        required: true,
    },
    created_at: {
        type: Date,
        required: true,
        default: Date.now,
    },
});


module.exports = mongoose.model("settings", settingsSchema);
