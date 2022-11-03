const mongoose = require('mongoose');

const cost_centerSchema = new mongoose.Schema({
    cost_center: {
        type:  String,
        required: true,
    },
    code: {
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


module.exports = mongoose.model("cost_center", cost_centerSchema);
