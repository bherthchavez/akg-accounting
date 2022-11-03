const mongoose = require('mongoose');

const supplier_billSchema = new mongoose.Schema({
    supplier_id: {
        type:  String,
        required: true,
    },
    supplier_name: {
        type:  String,
        required: true,
    },
    bill_number: {
        type:  String,
        required: true,
    },
    bill_date: {
        type:  String,
        required: true,
    },
    documents: {
        type:  String,
        required: true,
    },
    description: {
        type:  String,
        required: true,
    },
    total_payment: {
        type:  Number,
        required: true,
    },
    total_items: {
        type:  String,
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


module.exports = mongoose.model("supplier_bill", supplier_billSchema);