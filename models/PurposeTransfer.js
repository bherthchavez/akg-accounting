const mongoose = require('mongoose');

const purpose_transferSchema = new mongoose.Schema({
    purpose: {
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


module.exports =  mongoose.model("purpose_transfer", purpose_transferSchema);
