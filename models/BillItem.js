const mongoose = require('mongoose');

let bill_itemSchema = new mongoose.Schema({
    bill_number: {
        type:  String,
        required: true,
    },
    items: {
        type:  String,
        required: true,
    },
    items_description: {
        type:  String,
        required: true,
    },
    cost_center: {
        type:  String,
        required: true,
    },
    inv_no: {
        type:  String,
        required: true,
    },
    inv_date: {
        type:  String,
        required: true,
    },
    lpo: {
        type:  String,
        required: true,
    },
    items_price: {
        type:  Number,
        required: true,
    },
    items_qty: {
        type:  Number,
        required: true,
    },
    sub_total: {
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


module.exports = mongoose.model("bill_item", bill_itemSchema);