const mongoose = require('mongoose');

const Expenses_TypeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    code: {
        type: String,
        required: true,
    },
    created_by: {
        type: String,
        required: true,
    },
    updated_by: {
        type: String
    }
},
    {
        timestamps: true
    }
)


module.exports = mongoose.model("expenses_type", Expenses_TypeSchema);
