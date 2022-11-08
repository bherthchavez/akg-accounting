const Voucher = require('../models/Voucher');
const Invoice = require('../models/Invoice');
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
                                        vouNo: vouNo,
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
                        status: 2,
                        created_by: req.user.name
                    });
                    voucher.save();

                    const rentInfo = ({
                        voucher_no: req.body.vouNo,
                        date: req.body.date,
                        for_month: req.body.forMonth,
                        particulars: req.body.particulars,
                        total_rent: totalRent,
                        total_bills: totalBills,
                        cash_received: totalRecieved
                    });
                    Vehicles.findOne({ _id: req.body.vehicleID},(err, foundV)=>{
                        if(err){
                          res.json({message: err.message, type: 'danger'});
                        }else{
                            foundV.rented_info.push(rentInfo);
                            foundV.save();
                        }
                        });

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


                    Settings.findOne({ name: "voucher_settings" }, (err, voucherSetting) => {
                        let vouNo = parseFloat(voucherSetting.starting_no) + 1;
                        Settings.findOneAndUpdate({ name: "voucher_settings" },
                            { $set: { starting_no: vouNo } }, (err,) => {
                                if (err) {
                                    res.json({ message: err.message, type: 'danger' });
                                }
                            });
                    });

                    req.session.message = {
                        type: 'transac',
                        tType: 'voucher',
                        message: 'Voucher for vehicle no. ' + foundVehicle.vehicle_no + ' has been successfully created. Voucher No: ' + req.body.vouNo + ' Total Amount: QAR ' + (totalRecieved).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,' ),
                        transID: req.body.vehicleID,
                    };

                    res.redirect("/vehicle-list")
                }
            });


        } else {
            res.redirect("/sign-in");
        }
    },

    createInvoice: async (req, res) => {
        if (req.isAuthenticated()) {

            let id = req.params.id

            Vehicles.findById(id, (err, foundItem) => {
                if (err) {
                    res.json({ message: err.message, type: 'danger' });
                } else {

                    Vehicles.find().exec((err, foundVehicles) => {
                        if (err) {
                            res.json({ message: err.message, type: 'danger' });
                        } else {

                            Settings.findOne({ name: "invoice_settings" }, (err, voucherSetting) => {
                                if (err) {
                                    res.json({ message: err.message, type: 'danger' });
                                } else {
                                    let vouNo = voucherSetting.prefix + voucherSetting.starting_no;
                                    let nav = {
                                        title: "Accounts",
                                        child: "Vehicle"
                                    };

                                    res.render('create-invoice', {
                                        title: "Create Invoice",
                                        nav: nav,
                                        vouNo: vouNo,
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

    saveInvoice: async (req, res) => {
        if (req.isAuthenticated()) {

            Vehicles.findOne({ _id: req.body.vehicleID }, (err, foundVehicle) => {
                if (err) {
                    res.json({ message: err.message, type: 'danger' });
                } else {
                    const amount = + (req.body.amount).split(',').join('');
                    
                    let vId= ''
                    let vNo = ''
                    let cDetails =''

                    if (req.body.expensesFor ==='vehicle'){
                    
                        vId = req.body.vehicleID
                        vNo = foundVehicle.vehicle_no
                    }else{
                        vId = 'other'
                        vNo = 'other'
                    }

                     (req.body.paymentType) ==='card' ?  cDetails = req.body.cardDetails : cDetails='cash';
                    const invoice = new Invoice({
                        inv_no: req.body.invNo,
                        expenses_for: req.body.expensesFor,
                        vehicle_id: vId,
                        vehicle_no: vNo,
                        inv_date: req.body.invDate,
                        date: req.body.date,
                        payee: req.body.payee,
                        expenses_type: req.body.expenseType,
                        description: req.body.description,
                        payment_type: req.body.paymentType,
                        card_details: cDetails,
                        month: req.body.forMonth,
                        remarks: req.body.remarks,
                        amount: amount,
                        status: 2,
                        created_by: req.user.name
                    });

                    invoice.save();

                    let totalExpenses = 0;
                    
                    (req.body.expensesFor) ==='vehicle' ?  totalExpenses = foundVehicle.expenses : totalExpenses=0;
                    totalExpenses += amount;

                    Vehicles.findOneAndUpdate({ _id: req.body.vehicleID },
                        {
                            $set: {
                                expenses: totalExpenses
                            }
                        }, (err) => {
                            if (err) {
                                res.json({ message: err.message, type: 'danger' });
                            }
                        });


                    Settings.findOne({ name: "invoice_settings" }, (err, invSetting) => {
                        let invNo = parseFloat(invSetting.starting_no) + 1;
                        Settings.findOneAndUpdate({ name: "invoice_settings" },
                            { $set: { starting_no: invNo } }, (err,) => {
                                if (err) {
                                    res.json({ message: err.message, type: 'danger' });
                                }
                            });
                    });

                    req.session.message = {
                        type: 'transac',
                        tType: 'invoice',
                        message: 'Invoice has been successfully created. Invoice No: ' + req.body.invNo + ' Total Amount: QAR ' + (amount).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,' ),
                        transID: req.body.invNo,
                    };

                    res.redirect("/vehicle-list")
                }
            });


        } else {
            res.redirect("/sign-in");
        }
    },
}