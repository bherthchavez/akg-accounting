const mongoose = require('mongoose');

const bank_accountsSchema = new mongoose.Schema({
    bank_name: {
        type:  String,
        required: true,
    },
    account_name: {
        type:  String,
        required: true,
    },
    account_number: {
        type:  String,
        required: true,
    },
    account_type: {
        type:  String,
        required: true,
    },
    bank_email: {
        type:  String,
        required: true,
    },
    deposited: {
        type:  Number,
        required: true,
    },
    withdrawal: {
        type:  Number,
        required: true,
    },
    balance_amount: {
        type:  Number,
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


module.exports = mongoose.model("bank_account", bank_accountsSchema);