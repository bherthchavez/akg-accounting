const mongoose = require('mongoose');

const supplier_accountsSchema = new mongoose.Schema({
    supplier_name: {
        type:  String,
        required: true,
    },
    a_name: {
        type:  String,
        required: true,
    },
    contact_person: {
        type:  String,
        required: true,
    },
    email: {
        type:  String,
        required: true,
    },
    address: {
        type:  String,
        required: true,
    },
    opening_balance: {
        type:  Number,
        required: true,
    },
    beneficiary_name: {
        type:  String,
        required: true,
    },
    beneficiary_address: {
        type:  String,
        required: true,
    },
    bank_name: {
        type:  String,
        required: true,
    },
    iban_no: {
        type:  String,
        required: true,
    },
    swift_code: {
        type:  String,
        required: true,
    },
    billed: {
        type:  Number,
        required: true,
    },
    paid: {
        type:  Number,
        required: true,
    },
    balance_amount: {
        type:  Number,
        required: true,
    },
    active_status: {
        type:  String,
        required: true,
    },
    created_bills: {
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
    created: {
        type: Date,
        required: true,
        default: Date.now,
    },
});


module.exports =  mongoose.model("supplier_account", supplier_accountsSchema);