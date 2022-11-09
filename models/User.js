const mongoose = require('mongoose');
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type:  String,
        required: true,
    },
    username: {
        type: String,
        required: true,
        unique:true
    },
    email: {
        type:  String,
        required: true,
        unique:true
    },
    company: {
        type:  String,
        required: true
    },
    position: {
        type:  String,
        required: true
    },
    role: {
        type:  Number,
        required: true
    },
    status: {
        type:  Number,
        default: 1,
    },
    created_by: {
        type:  String,
        required: true
    }
},
{
    timestamps: true
});

userSchema.plugin(passportLocalMongoose);

module.exports = new mongoose.model("User", userSchema);