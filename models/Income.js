const mongoose = require('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose)

const incomeSchema = new mongoose.Schema(
    {
        voucher_no: {
            type: String,
            required: true
        },
        date: {
            type: String,
            required: true
        },
        for_month: {
            type: String,
            required: true
        },
        particulars: {
            type: String,
            required: true
        },
        total_rent: {
            type: String,
            required: true
        },
        total_bills: {
            type: String,
            required: true
        },
        cash_received: {
            type: String,
            required: true
        },
        status: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
)

incomeSchema.plugin(AutoIncrement, {
    inc_field: 'SL',
    id: 'slNumber',
    start_seq: 300
})

module.exports = mongoose.model('income', incomeSchema)