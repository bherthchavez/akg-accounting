const mongoose = require('mongoose');

const chart_of_accountsSchema = new mongoose.Schema({
    name: {
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


module.exports = mongoose.model("chart_of_account", chart_of_accountsSchema);
