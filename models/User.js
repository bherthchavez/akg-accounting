const mongoose = require('mongoose');
const passportLocalMongoose = require("passport-local-mongoose");
const passport =require("passport");

const userSchema = new mongoose.Schema({
    name: {
        type:  String,
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type:  String,
        required: true,
    },
    userRole: {
        type:  String,
        required: true,
    },
    image: {
        type:  String,
        required: true,
    },
    created_by: {
        type: String,
        required: true,
    },
    active: {
        type: Boolean,
        default: true
    }
},
{
    timestamps: true
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

module.exports = new mongoose.model("User", userSchema);