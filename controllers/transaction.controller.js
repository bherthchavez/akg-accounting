const Voucher = require('../models/Voucher');
const Vehicles = require('../models/Vehicles');
const Settings = require('../models/Settings');



module.exports = {

    createVoucher: async (req, res) => {
        if (req.isAuthenticated()) {

            let id = req.params.id

            Vehicles.findById(id, (err, foundItem) => {
                if (err) {
                    res.json({ message: err.message, type: 'danger' });
                } else {

                    Vehicles.find({ status: "Available" }).exec((err, foundVehicles) => {
                        if (err) {
                            res.json({ message: err.message, type: 'danger' });
                        } else {

                            Settings.findOne({ name: "voucher_settings" }, (err, voucherSetting) => {
                                if (err) {
                                    res.json({ message: err.message, type: 'danger' });
                                } else {
                                    let vouNo = voucherSetting.prefix + voucherSetting.starting_no;
                                    let nav = {
                                        title: "Accounts",
                                        child: "Vehicle"
                                    };

                                    res.render('create-voucher', {
                                        title: "Create Voucher",
                                        nav: nav,
                                        vouNo:vouNo,
                                        foundVehicles: foundVehicles,
                                        vehicleNo: foundItem.vehicle_no,

                                    });
                                }
                            });
                        }
                    });
                }
            });


        } else {
            res.redirect("/sign-in");
        }
    },

    saveVoucher: async (req, res) => {
        if (req.isAuthenticated()) {

            Vehicles.findOne({ _id: req.body.vehicleID }, (err, foundVehicle) => {
                if (err) {
                    res.json({ message: err.message, type: 'danger' });
                } else {
                    const totalRent = + (req.body.totalRent).split(',').join('');
                    const totalBills = + (req.body.totalBills).split(',').join('');
                    const totalRecieved = totalRent - totalBills;

                    const voucher = new Voucher({
                        voucher_no: req.body.vouNo,
                        vehicle_id: req.body.vehicleID,
                        vehicle_no: foundVehicle.vehicle_no,
                        date: req.body.date,
                        for_month: req.body.forMonth,
                        particulars: req.body.particulars,
                        total_rent: totalRent,
                        total_bills: totalBills,
                        cash_received: totalRecieved,
                        status: "Pending",
                        created_by: req.user.name
                    });
                    voucher.save();

                    let totalIncome = 0;

                    totalIncome = + foundVehicle.income;
                    totalIncome += totalRent;

                    Vehicles.findOneAndUpdate({ _id: req.body.vehicleID },
                        {
                            $set: {
                                income: totalIncome,
                                status: 'Rented'
                            }
                        }, (err) => {
                            if (err) {
                                res.json({ message: err.message, type: 'danger' });
                            }
                        });


                    Settings.findOne({name: "voucher_settings"}, (err, voucherSetting)=>{
                        let vouNo = parseFloat(voucherSetting.starting_no) + 1;
                            Settings.findOneAndUpdate({name: "voucher_settings"},
                            {$set: {starting_no:  vouNo}}, (err,)=>{
                                if (err){
                                res.json({message: err.message, type: 'danger'});
                                }
                                });
                        });

                    req.session.message = {
                        type: 'transac',
                        tType: 'voucher',
                        message: 'Voucher for vehicle no. ' + foundVehicle.vehicle_no + ' has been successfully created. Voucher No: ' + req.body.vouNo + ' Total Amount: QAR ' + totalRecieved,
                        transID: req.body.vehicleID,
                    };

                    res.redirect("/vehicle-list")
                }
            });


        } else {
            res.redirect("/sign-in");
        }
    },

    createExpenses: async (req, res) => {
        if (req.isAuthenticated()) {

        } else {
            res.redirect("/sign-in");
        }
    },
}