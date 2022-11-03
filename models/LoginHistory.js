const mongoose = require('mongoose');

const loginLogsSchema = new mongoose.Schema({
    name: {
        type:  String,
        required: true,
    },
    user_name: {
        type:  String,
        required: true,
    },
    id_address: {
        type:  String,
        required: true,
    },
    id_address2: {
        type:  String,
        required: true,
    },
    status: {
        type:  String,
        required: true,
    },
  
    login_at: {
        type: Date,
        required: true,
        default: Date.now,
    },
});

module.exports = new mongoose.model("loginLogs", loginLogsSchema);