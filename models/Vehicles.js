const mongoose = require('mongoose');

const vehiclesSchema = new mongoose.Schema(
    {
    vehicle_no: {
        type:  String,
        required: true,
    },
    make_model: {
        type:  String,
        required: true,
    },
    registered_owner: {
        type:  String,
        required: true,
    },
    registered_date: {
        type:  String,
        required: true,
    },
    istimara_exdate: {
        type:  String,
        required: true,
    },
    istimara_info: [{
        voucher_no:  String,
        date: String,
        for_month:  String,
        particulars:  String,
        total_rent:  String,
        total_bills:   String,
        cash_received: String,
    }],
    rented_info: [{
        voucher_no:  String,
        date: String,
        for_month:  String,
        particulars:  String,
        total_rent:  Number,
        total_bills:   Number,
        cash_received: Number,
    }],
    expenses: {
        type:  Number,
        required: true,
    },
    income: {
        type:  Number,
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
},
{
    timestamps: true
}
);


module.exports =  mongoose.model("vehicles", vehiclesSchema);