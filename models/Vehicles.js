const mongoose = require('mongoose');

const vehiclesSchema = new mongoose.Schema(
    {
    vehicle_no: {
        type:  String,
        required: true,
        unique:true
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
        type:  Date,
        required: true,
    },
    istimara_file: {
        type:  String,
        required: true
    },
    insurance_exdate: {
        type:  Date,
        required: true,
    },
    insurance_file: {
        type:  String,
        required: true
    },
    expenses: {
        type:  Number,
        required: true,
    },
    income: {
        type:  Number,
        required: true,
    },
    status: {
        type:  Number,
        required: true,
    },
    voucher_id: {
        type:  String,
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