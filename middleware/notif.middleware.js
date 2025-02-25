const Employee = require('../models/Employee');
const Invoice = require('../models/Invoice');
const Vehicles = require('../models/Vehicles');
const Settings = require('../models/Settings');

(async function initializeSettings() {
    try {
        const foundSettings = await Settings.find().exec();
        if (foundSettings.length === 0) {
            const defaultSettings = [
                { name: "voucher_settings", prefix: "#VOU/2022/", starting_no: 100, created_by: "Admin" },
                { name: "invoice_settings", prefix: "#INV/2022/", starting_no: 100, created_by: "Admin" },
                { name: "expenses_settings", value: 0, created_by: "Admin" },
                { name: "documents_settings", value: 0, created_by: "Admin" }
            ];

            await Settings.insertMany(defaultSettings);
            console.log("Successfully saved default settings to DB.");
        }
    } catch (err) {
        console.error("Error initializing settings:", err.message);
    }
})();

module.exports = {
    getINV: async () => {
        try {
            return await Invoice.find({ status: 2 }).exec();
        } catch (err) {
            throw new Error(err.message);
        }
    },

    getVehicle: async () => {
        try {
            const settings = await Settings.findOne({ name: "documents_settings" }).exec();
            return await Vehicles.find({ istimara_exdate: { $lte: new Date(Date.now() + settings.value * 24 * 60 * 60 * 1000) } }).exec();
        } catch (err) {
            throw new Error(err.message);
        }
    },

    getVehicleIn: async () => {
        try {
            const settings = await Settings.findOne({ name: "documents_settings" }).exec();
            return await Vehicles.find({ insurance_exdate: { $lte: new Date(Date.now() + settings.value * 24 * 60 * 60 * 1000) } }).exec();
        } catch (err) {
            throw new Error(err.message);
        }
    },

    getEmployee: async () => {
        try {
            const settings = await Settings.findOne({ name: "documents_settings" }).exec();
            return await Employee.find({ ex_qid: { $lte: new Date(Date.now() + settings.value * 24 * 60 * 60 * 1000) } }).exec();
        } catch (err) {
            throw new Error(err.message);
        }
    }
};
