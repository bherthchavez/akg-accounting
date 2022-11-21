const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema(
    {
    fname: {
        type:  String,
        required: true
    },
    mname: {
        type:  String,
        required: true
    },
    lname: {
        type:  String,
        required: true,
    },
    gender: {
        type:  String,
        required: true,
    },
    email: {
        type:  String,
        required: true,
    },
    contact_no: {
        type:  String,
        required: true
    },
    address: {
        type:  String,
        required: true
    },
    qid: {
        type:  String,
        required: true,
        unique:true
    },
    ex_qid: {
        type:  Date,
        required: true,
    },
    qid_file: {
        type:  String,
        required: true
    },
    bank_name: {
        type:  String,
        required: true,
    },
    iban: {
        type:  String,
        required: true,
    },
    salary: {
        type:  Number,
        required: true
    },
    status: {
        type:  Number,
        required: true
    },
    company_id: {
        type:  String,
        required: true
    },
    updated_by: {
        type:  String
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


module.exports =  mongoose.model("employee", EmployeeSchema);