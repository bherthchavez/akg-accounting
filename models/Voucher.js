const mongoose = require('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose)

const voucherSchema = new mongoose.Schema(
    {
        voucher_no: {
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
            type: Number,
            required: true
        },
        total_bills: {
            type: Number,
            required: true
        },
        cash_received: {
            type: Number,
            required: true
        },
        status: {
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

voucherSchema.plugin(AutoIncrement, {
    inc_field: 'SL',
    id: 'slNumber',
    start_seq: 300
})

module.exports = mongoose.model('voucher', voucherSchema)