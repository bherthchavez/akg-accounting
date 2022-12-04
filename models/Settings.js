const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    name: {
        type:  String,
        required: true,
    },
    value: {
        type:  Number
    },
    prefix: {
        type:  String
    },
    starting_no: {
        type:  Number
    },
    created_by: {
        type:  String,
        required: true,
    },
    updated_by: {
        type:  String
    }
},
{
    timestamps: true
});


module.exports = mongoose.model("settings", settingsSchema);
