const Employee = require('../models/Employee');
const Invoice = require('../models/Invoice');
const Vehicles = require('../models/Vehicles');
const Settings = require('../models/Settings');

Settings.find({}, (err, foundSettings) => {
   if (foundSettings.length === 0) {

      const settings1 = new Settings({
         name: "voucher_settings",
         prefix: "#VOU/2022/",
         starting_no: 100,
         created_by: "Admin"
      });

      const settings2 = new Settings({
         name: "invoice_settings",
         prefix: "#INV/2022/",
         starting_no: 100,
         created_by: "Admin"
      });
      const settings3 = new Settings({
         name: "expenses_settings",
         value: 0,
         created_by: "Admin"
      });
      const settings4 = new Settings({
         name: "documents_settings",
         value: 0,
         created_by: "Admin"
      });

      const defaultSettings = [settings1, settings2, settings3, settings4];

      Settings.insertMany(defaultSettings, err => {
         if (err) {
            res.json({ message: err.message });
         } else {
            console.log("Successfully saved default settings to DB.");

         }
      })
   }
})


module.exports = {
   getINV: (callback) => {
      Invoice.find({ status: 2 }, (err, data) => {
         if (!err && data) {
            return callback(null, data);
         } else {
            return callback(err, null);
         }
      });
   },
   getVehicle: (callback) => {
      Settings.find({}, (err, foundSettings) => {
         if (err) {
            res.json({ message: err.message });
         } else {

            Vehicles.find({ istimara_exdate: { $lte: new Date(new Date().setDate(new Date().getDate() + foundSettings[3].value)) } }, (err, data) => {
               if (!err && data) {
                  return callback(null, data);
               } else {
                  return callback(err, null);
               }
            })

         }
      })


   },
   getVehicleIn: (callback) => {

      Settings.find({}, (err, foundSettings) => {
         if (err) {
            res.json({ message: err.message });
         } else {

            Vehicles.find({ insurance_exdate: { $lte: new Date(new Date().setDate(new Date().getDate() + foundSettings[3].value)) } }, (err, data) => {
               if (!err && data) {
                  return callback(null, data);
               } else {
                  return callback(err, null);
               }
            })
         }
      })
   },
   getEmployee: (callback) => {

      Settings.find({}, (err, foundSettings) => {
         if (err) {
            res.json({ message: err.message });
         } else {
            Employee.find({ ex_qid: { $lte: new Date(new Date().setDate(new Date().getDate() + foundSettings[3].value)) } }, (err, data) => {
               if (!err && data) {
                  return callback(null, data);
               } else {
                  return callback(err, null);
               }
            })
         }
      })
   }
}