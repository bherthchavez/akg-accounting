const mongoose = require('mongoose');

let payment_vouchersSchema = new mongoose.Schema({
    payment_voucher_no: {
        type:  String,
        required: true,
    },
    supplier_id: {
        type:  String,
        required: true,
    },
    supplier_name: {
        type:  String,
        required: true,
    },
    payment_from: {
        type:  String,
        required: true,
    },
    bank_id: {
        type:  String,
        required: true,
    },
    payment_mode: {
        type:  String,
        required: true,
    },
    bank_transfer: [{
        b_name:  String,
        b_address: String,
        payment_from:  String,
        bank_name:  String,
        iban_no:  String,
        swift_code:   String,
        transfer_charge: String,
        transfer_purpose: String,
        currency: String,
        amount: Number,
        amountInWords: String,
        transfer_amount: Number
    }],

    cheque: [{
       
        cheque_no:  String,
        beneficiary_name:  String,
        cheque_date:  String,
        cheque_status:  String,
        cheque_amount:  Number,
    }],

    date: {
        type:  String,
        required: true,
    },
    description: {
        type:  String,
        required: true,
    },
    documents: {
        type:  String,
        required: true,
    },
    total_payment: {
        type:  Number,
        required: true,
    },
    amountInWords: {
        type:  String,
        required: true,
    },
    selected_bill_no: {
        type:  Array,
        required: true,
    },
    status: {
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


module.exports = mongoose.model("payment_voucher", payment_vouchersSchema);