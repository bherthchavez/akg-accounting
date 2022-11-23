const mongoose = require('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose)

const invoiceSchema = new mongoose.Schema(
    {
        inv_no: {
            type: String,
            required: true
        },
        expenses_for: {
            type: String,
            required: true
        },
        vehicle_id: {
            type: String,
            required: true
        },
        vehicle_no: {
            type: String,
            required: true
        },
        inv_date: {
            type: String,
            required: true
        },
        date: {
            type: String,
            required: true
        },
        payee: {
            type: String,
            required: true
        },
        expenses_type: {
            type: String,
            required: true
        },
        
        description: {
            type: String,
            required: true
        },
        payment_type: {
            type: String,
            required: true
        },
        card_details: {
            type: String
        },
        month: {
            type: String,
            required: true
        },
        remarks: {
            type: String,
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        status: {
            type: Number,
            required: true
        },
        approval_rsn: {
            type: String
        },
        created_by: {
            type: String,
            required: true
        },
        updated_by: {
            type: String
        },
        company_id: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
)

invoiceSchema.plugin(AutoIncrement, {
    inc_field: 'SLinv',
    id: 'slInvNumber',
    start_seq: 300
})

module.exports = mongoose.model('invoice', invoiceSchema)