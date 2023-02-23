const mongoose = require('mongoose')

const companySponSchema = new mongoose.Schema(
    {
        legal_name: {
            type: String,
            required: true
        },
        commercial_name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        created_by: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
)


module.exports = mongoose.model('companySponsored', companySponSchema)