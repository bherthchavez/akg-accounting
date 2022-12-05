const Voucher = require('../models/Voucher');
const Invoice = require('../models/Invoice');
const Vehicles = require('../models/Vehicles');
const Settings = require('../models/Settings');
const ExpensesType = require('../models/ExpensesType');

const Notif = require('../middleware/notif.middleware');

module.exports = {

    createVoucher: async (req, res) => {
        if (req.isAuthenticated()) {

            let id = req.params.id

            Vehicles.find({ status: 1 }).exec((err, foundVehicles) => {
                if (err) {
                    res.json({ message: err.message, type: 'danger' });
                } else {

                    Settings.findOne({ name: "voucher_settings" }, (err, voucherSetting) => {
                        if (err) {
                            res.json({ message: err.message, type: 'danger' });
                        } else {

                            Notif.getINV((err, dataINV) => {
                                Notif.getVehicle((err, dataVehicle) => {
                                    Notif.getVehicleIn((err, dataVehicleIn) => {
                                        Notif.getEmployee((err, dataEmployee) => {

                                            if (id != 'others') {

                                                Vehicles.findById(id).exec((err, result) => {
                                                    if (err) {
                                                        res.json({ message: err.message, type: 'danger' });
                                                    } else {

                                                        let vouNo = voucherSetting.prefix + voucherSetting.starting_no;



                                                        let nav = {
                                                            title: "Accounts",
                                                            child: "Vehicle",
                                                            view: 2,
                                                            notif: {
                                                                exIstimara: dataVehicle,
                                                                exInsurance: dataVehicleIn,
                                                                expenPending: dataINV,
                                                                exQID: dataEmployee
                                                            }
                                                        };

                                                        res.render('create-voucher', {
                                                            title: "Create Voucher",
                                                            nav: nav,
                                                            vouNo: vouNo,
                                                            foundVehicles: foundVehicles,
                                                            vehicleNo: result.vehicle_no

                                                        })


                                                    }
                                                })

                                            } else {

                                                let vouNo = voucherSetting.prefix + voucherSetting.starting_no;
                                                let nav = {
                                                    title: "Accounts",
                                                    child: "Vehicle",
                                                    view: 2,
                                                    notif: {
                                                        exIstimara: dataVehicle,
                                                        exInsurance: dataVehicleIn,
                                                        expenPending: dataINV,
                                                        exQID: dataEmployee
                                                    }
                                                };

                                                res.render('create-voucher', {
                                                    title: "Create Voucher",
                                                    nav: nav,
                                                    vouNo: vouNo,
                                                    foundVehicles: foundVehicles,
                                                    vehicleNo: 'others'

                                                });
                                            }

                                        })
                                    })
                                })
                            })

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

            const vouherFor = req.body.voucherFor
            let vID = req.body.voucherFor
            let vNo = req.body.voucherFor


            const totalRent = + (req.body.totalRent).split(',').join('');
            const totalBills = + (req.body.totalBills).split(',').join('');
            const totalRecieved = totalRent - totalBills;


            if (vouherFor != 'Others') { // for Rent Vehicle Transaction

                Vehicles.findOne({ _id: vouherFor }, (err, foundVehicle) => {
                    if (err) {
                        res.json({ message: err.message, type: 'danger' });
                    } else {
                        vNo = foundVehicle.vehicle_no
                        vID = foundVehicle._id

                        const voucher = new Voucher({
                            voucher_no: req.body.vouNo,
                            voucher_for: vouherFor,
                            vehicle_id: vID,
                            vehicle_no: vNo,
                            date: req.body.date,
                            for_month: req.body.forMonth,
                            particulars: req.body.particulars,
                            total_rent: totalRent,
                            total_bills: totalBills,
                            cash_received: totalRecieved,
                            status: 2,
                            vehicle_status: 2,
                            company_id: req.user.company_id,
                            created_by: req.user.name
                        });
                        voucher.save((err, docs) => {

                            if (err) {
                                res.json({ message: err.message, type: 'danger' });
                            } else {

                                Settings.findOne({ name: "voucher_settings" }, (err, voucherSetting) => {
                                    let vouNo = parseFloat(voucherSetting.starting_no) + 1;
                                    Settings.findOneAndUpdate({ name: "voucher_settings" },
                                        { $set: { starting_no: vouNo } }, (err,) => {
                                            if (err) {
                                                res.json({ message: err.message, type: 'danger' });
                                            }
                                        });
                                });


                                let totalIncome = 0;
                                totalIncome = + foundVehicle.income;
                                totalIncome += totalRent;

                                Vehicles.findOneAndUpdate({ _id: vID },
                                    {
                                        $set: {
                                            income: totalIncome,
                                            status: 2,
                                            voucher_id: docs._id
                                        }
                                    }, (err) => {
                                        if (err) {
                                            res.json({ message: err.message, type: 'danger' });
                                        }
                                    });

                                req.session.message = {
                                    type: 'transac',
                                    tType: 'voucherV',
                                    message: 'Voucher for vehicle no. ' + foundVehicle.vehicle_no + ' has been successfully created. Voucher No: ' + req.body.vouNo + ' Total Amount: QAR ' + (totalRecieved).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,'),
                                    transID: docs._id,
                                };

                                res.redirect("/vehicle-list")


                            }

                        });


                        // const rentInfo = ({
                        //     voucher_no: req.body.vouNo,
                        //     date: req.body.date,
                        //     for_month: req.body.forMonth,
                        //     particulars: req.body.particulars,
                        //     total_rent: totalRent,
                        //     total_bills: totalBills,
                        //     cash_received: totalRecieved
                        // });

                        // foundVehicle.rented_info.push(rentInfo);
                        // foundVehicle.save();



                    }
                });

            } else { // --- Other Transactions 

                const voucher = new Voucher({
                    voucher_no: req.body.vouNo,
                    voucher_for: vouherFor,
                    vehicle_id: vID,
                    vehicle_no: vNo,
                    date: req.body.date,
                    for_month: req.body.forMonth,
                    particulars: req.body.particulars,
                    total_rent: totalRent,
                    total_bills: totalBills,
                    cash_received: totalRecieved,
                    status: 2,
                    company_id: req.user.company_id,
                    created_by: req.user.name
                });
                voucher.save((err, docs) => {
                    if (err) {
                        res.json({ message: err.message, type: 'danger' });
                    } else {

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
                            message: 'Voucher has been successfully created. Voucher No: ' + req.body.vouNo + ' Total Amount: QAR ' + (totalRecieved).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,'),
                            transID: docs._id,
                        };

                        res.redirect("/")
                    }

                });


            }

        } else {
            res.redirect("/sign-in");
        }
    },

    viewVoucher: async (req, res) => {
        if (req.isAuthenticated()) {

            let id = req.params.id;

            Voucher.findById(id, (err, result) => {
                if (err || !result) {
                    req.session.message = {
                        type: 'danger',
                        message: "Transaction cannot view. Error: " + err,
                    };
                    res.redirect("/");
                } else {

                    if (result) {

                        req.session.message = {
                            type: 'viewVoucher',
                            for: result.voucher_for,
                            id: result._id,
                            vehicleNo: result.vehicle_no,
                            voucherNo: result.voucher_no,
                            date: result.date,
                            month: result.for_month,
                            particulars: result.particulars,
                            rent: result.total_rent,
                            bills: result.total_bills,
                            received: result.cash_received,
                            status: result.status,
                            vehicleStatus: result.vehicle_status
                        };

                        res.redirect('/')

                    } else {

                        res.redirect('/')
                    }
                }
            });

        } else {
            res.redirect("/sign-in");
        }
    },

    saveUpdateVou: async (req, res) => {
        if (req.isAuthenticated()) {

            let id = req.params.id;

            Voucher.findById(id, (err, resultVoucher) => {
                if (err || !resultVoucher) {
                    req.session.message = {
                        type: 'danger',
                        message: "Transaction cannot view. Error: " + err,
                    };
                    res.redirect("/");
                } else {

                    if (resultVoucher.voucher_for != 'Others') {

                        Voucher.findByIdAndUpdate(id, {
                            total_rent: req.body.totalRent,
                            total_bills: req.body.totalBills,
                            cash_received: req.body.cashReceived,
                            status: + req.body.status,
                            vehicle_status: + req.body.vehicleStatus
                        }, (err, result) => {
                            if (err) {
                                res.json({ message: err.message, type: 'danger' });
                            } else {


                                if (parseInt(req.body.vehicleStatus) === 1) {

                                    Vehicles.findOneAndUpdate({ _id: result.vehicle_id }, { status: 1, voucher_id: '' }, (err, foundList) => {
                                        if (err) {
                                            res.json({ message: err.message, type: 'danger' });
                                        }
                                    });

                                }

                                req.session.message = {
                                    type: 'transac',
                                    tType: 'voucherU',
                                    message: 'Voucher for vehicle no. ' + req.body.vehicleNo + ' has been successfully return. Voucher No: ' + req.body.vouNo + ' Total Amount: QAR ' + req.body.totalRent,
                                    transID: result._id
                                };
                                res.redirect('/vehicle-list')

                            }
                        });


                    } else {

                        Voucher.findByIdAndUpdate(id, {
                            total_rent: req.body.totalRent,
                            total_bills: req.body.totalBills,
                            cash_received: req.body.cashReceived,
                            status: + req.body.status
                        }, (err, result) => {
                            if (err) {

                                res.json({ message: err.message, type: 'danger' });
                            } else {

                                req.session.message = {
                                    type: 'transac',
                                    tType: 'voucherU',
                                    message: 'Voucher has been successfully updated. Voucher No: ' + result.voucher_no + ' Total Amount: QAR ' + result.total_rent,
                                    transID: result._id
                                };
                                res.redirect('/')

                            }
                        });

                    }


                }
            });


        } else {
            res.redirect("/sign-in");
        }
    },

    updateVoucher: async (req, res) => {
        if (req.isAuthenticated()) {

            let id = req.params.id

            Voucher.findOne({ _id: id }, (err, foundVoucher) => {
                if (err) {
                    res.json({ message: err.message });
                } else {
                    Notif.getINV((err, dataINV) => {
                        Notif.getVehicle((err, dataVehicle) => {
                            Notif.getVehicleIn((err, dataVehicleIn) => {
                                Notif.getEmployee((err, dataEmployee) => {

                                    let nav = {
                                        title: "Accounts",
                                        child: "Vehicle",
                                        view: 2,
                                        notif: {
                                            exIstimara: dataVehicle,
                                            exInsurance: dataVehicleIn,
                                            expenPending: dataINV,
                                            exQID: dataEmployee
                                        }
                                    };

                                    res.render('update-voucher', {
                                        title: "Update Voucher",
                                        VoucherFound: foundVoucher,
                                        nav: nav
                                    })
                                })
                            })
                        })
                    })

                }
            });


        } else {
            res.redirect("/sign-in");
        }
    },

    createInvoice: async (req, res) => {
        if (req.isAuthenticated()) {

            let id = req.params.id

            Vehicles.find().exec((err, foundVehicles) => {
                if (err) {
                    res.json({ message: err.message, type: 'danger' })
                } else {

                    ExpensesType.find().exec((err, foundExpensesType) => {
                        if (err) {
                            res.json({ message: err.message, type: 'danger' })
                        } else {

                            Settings.findOne({ name: "invoice_settings" }, (err, voucherSetting) => {
                                if (err) {
                                    res.json({ message: err.message, type: 'danger' })
                                } else {

                                    Notif.getINV((err, dataINV) => {
                                        Notif.getVehicle((err, dataVehicle) => {
                                            Notif.getVehicleIn((err, dataVehicleIn) => {
                                                Notif.getEmployee((err, dataEmployee) => {

                                                    if (id != 'others') {

                                                        Vehicles.findById(id).exec((err, result) => {
                                                            if (err) {
                                                                res.json({ message: err.message, type: 'danger' });
                                                            } else {

                                                                let vouNo = voucherSetting.prefix + voucherSetting.starting_no;
                                                                let nav = {
                                                                    title: "Accounts",
                                                                    child: "Vehicle",
                                                                    view: 2,
                                                                    notif: {
                                                                        exIstimara: dataVehicle,
                                                                        exInsurance: dataVehicleIn,
                                                                        expenPending: dataINV,
                                                                        exQID: dataEmployee
                                                                    }
                                                                };

                                                                res.render('create-invoice', {
                                                                    title: "Create Invoice",
                                                                    nav: nav,
                                                                    vouNo: vouNo,
                                                                    foundVehicles: foundVehicles,
                                                                    vehicleNo: result.vehicle_no,
                                                                    foundExpensesType: foundExpensesType

                                                                });


                                                            }
                                                        })

                                                    } else {

                                                        let vouNo = voucherSetting.prefix + voucherSetting.starting_no;
                                                        let nav = {
                                                            title: "Accounts",
                                                            child: "Vehicle",
                                                            view: 2,
                                                            notif: {
                                                                exIstimara: dataVehicle,
                                                                exInsurance: dataVehicleIn,
                                                                expenPending: dataINV,
                                                                exQID: dataEmployee
                                                            }
                                                        };

                                                        res.render('create-invoice', {
                                                            title: "Create Invoice",
                                                            nav: nav,
                                                            vouNo: vouNo,
                                                            foundVehicles: foundVehicles,
                                                            foundExpensesType:foundExpensesType,
                                                            vehicleNo: 'others'

                                                        });
                                                    }

                                                })
                                            })
                                        })
                                    })


                                }
                            })
                        }
                    })
                }
            })

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

                    let vId = ''
                    let vNo = ''
                    let cDetails = ''

                    if (req.body.expensesFor === 'vehicle') {

                        vId = req.body.vehicleID
                        vNo = foundVehicle.vehicle_no
                    } else {
                        vId = 'Others'
                        vNo = 'Others'
                    }




                    (req.body.paymentType) === 'card' ? cDetails = req.body.cardDetails : cDetails = 'cash';

                    Settings.findOne({ name: "expenses_settings" }, (err, expenSet) => {
                        if (err) {
                            res.json({ message: err.message, type: 'danger' })
                        } else {
                            const setStatus = (amount) >= expenSet.value ? 2 : 1


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
                                status: setStatus,
                                company_id: req.user.company_id,
                                created_by: req.user.name
                            })

                            invoice.save((err, docs) => {

                                if (err) {
                                    res.json({ message: err.message, type: 'danger' });
                                } else {


                                    let totalExpenses = 0;

                                    (req.body.expensesFor) === 'vehicle' ? totalExpenses = foundVehicle.expenses : totalExpenses = 0;
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
                                        })


                                    Settings.findOne({ name: "invoice_settings" }, (err, invSetting) => {
                                        let invNo = parseFloat(invSetting.starting_no) + 1;
                                        Settings.findOneAndUpdate({ name: "invoice_settings" },
                                            { $set: { starting_no: invNo } }, (err,) => {
                                                if (err) {
                                                    res.json({ message: err.message, type: 'danger' });
                                                }
                                            })
                                    })

                                    let notifMsg;
                                    (req.body.expensesFor) === 'vehicle' ? notifMsg = 'Invoice for vehicle: ' + vNo : notifMsg = 'Invoice';

                                    req.session.message = {
                                        type: 'transac',
                                        tType: 'invoice',
                                        message: notifMsg + ' has been successfully created. Invoice No: ' + docs.inv_no + ' Total Amount: QAR ' + (amount).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,'),
                                        transID: docs._id,
                                    }


                                    const redirect = (req.body.expensesFor) === 'vehicle' ? res.redirect("/vehicle-list") : res.redirect("/");
                                }
                            })




                        }
                    })

                }
            })


        } else {
            res.redirect("/sign-in");
        }
    },

    viewInvoice: async (req, res) => {
        if (req.isAuthenticated()) {

            let id = req.params.id;

            Invoice.findById(id, (err, result) => {
                if (err || !result) {
                    req.session.message = {
                        type: 'danger',
                        message: "Transaction cannot view. Error: " + err,
                    };
                    res.redirect("/");
                } else {

                    if (result) {

                        req.session.message = {
                            type: 'viewInvoice',
                            invNo: result.inv_no,
                            for: result.expenses_for,
                            id: result._id,
                            vehicleNo: result.vehicle_no,
                            date: result.date,
                            payee: result.payee,
                            expensesType: result.expenses_type,
                            description: result.description,
                            paymentType: result.payment_type,
                            month: result.month,
                            remarks: result.remarks,
                            amount: result.amount,
                            status: result.status,
                            reason: result.approval_rsn,
                            createdBy: result.created_by
                        };

                        res.redirect('/')

                    } else {

                        res.redirect('/')
                    }
                }
            });

        } else {
            res.redirect("/sign-in");
        }
    },

    updateInvoice: async (req, res) => {
        if (req.isAuthenticated()) {

            let id = req.params.id

            Invoice.findOne({ _id: id }, (err, foundInv) => {
                if (err) {
                    res.json({ message: err.message });
                } else {
                    Notif.getINV((err, dataINV) => {
                        Notif.getVehicle((err, dataVehicle) => {
                            Notif.getVehicleIn((err, dataVehicleIn) => {
                                Notif.getEmployee((err, dataEmployee) => {

                                    let nav = {
                                        title: "Accounts",
                                        child: "Vehicle",
                                        view: 2,
                                        notif: {
                                            exIstimara: dataVehicle,
                                            exInsurance: dataVehicleIn,
                                            expenPending: dataINV,
                                            exQID: dataEmployee
                                        }
                                    };

                                    res.render('update-invoice', {
                                        title: "Update Voucher",
                                        foundInv: foundInv,
                                        nav: nav
                                    })
                                })
                            })
                        })
                    })

                }
            });


        } else {
            res.redirect("/sign-in");
        }
    },

    saveUpdateInv: async (req, res) => {
        if (req.isAuthenticated()) {

            let id = req.params.id;

            let cDetails;
            (req.body.paymentType) === 'Card' ? cDetails = req.body.cardDetails : cDetails = 'Cash';
            const amount = + (req.body.amount).split(',').join('');



            Settings.findOne({ name: "expenses_settings" }, (err, expenSet) => {
                if (err) {
                    res.json({ message: err.message, type: 'danger' })
                } else {
                    const setStatus = (amount) >= expenSet.value ? 2 : 1


                    Invoice.findById(id, (err, resultInvoice) => {
                        if (err || !resultInvoice) {
                            req.session.message = {
                                type: 'danger',
                                message: "Transaction cannot view. Error: " + err,
                            };
                            res.redirect("/");
                        } else {

                            if (resultInvoice.expenses_for != 'Others') {

                                Invoice.findByIdAndUpdate(id, {
                                    inv_date: req.body.invDate,
                                    date: req.body.date,
                                    payee: req.body.payee,
                                    expenses_type: req.body.expenseType,
                                    description: req.body.description,
                                    payment_type: req.body.paymentType,
                                    card_details: cDetails,
                                    month: req.body.forMonth,
                                    remarks: req.body.remarks,
                                    status: setStatus,
                                    amount: amount,
                                    updated_by: req.user.name

                                }, (err, result) => {
                                    if (err) {
                                        req.session.message = {
                                            type: 'danger',
                                            message: "Transaction cannot save. Error: " + err,
                                        };
                                        res.redirect("/");
                                    } else {


                                        Vehicles.findOne({ vehicle_no: req.body.vehicleID }, (err, resulVehicle) => {
                                            if (err || !resulVehicle) {
                                                req.session.message = {
                                                    type: 'danger',
                                                    message: "Transaction error. Error: " + err,
                                                };
                                                res.redirect("/");
                                            } else {

                                                let totalEx = resulVehicle.expenses - resultInvoice.amount

                                                Vehicles.findOneAndUpdate({ vehicle_no: req.body.vehicleID },
                                                    {
                                                        $set: {
                                                            expenses: totalEx + amount
                                                        }
                                                    }, (err) => {
                                                        if (err) {
                                                            res.json({ message: err.message, type: 'danger' });
                                                        }
                                                    })

                                            }
                                        })





                                        req.session.message = {
                                            type: 'transac',
                                            tType: 'invUpdate',
                                            message: 'Invoice for vehicle no. ' + result.vehicle_no + ' has been successfully updated. Invoice No: ' + result.inv_no + ' Total Amount: QAR ' + amount,
                                            transID: result._id
                                        };
                                        res.redirect('/vehicle-list')

                                    }
                                });


                            } else {

                                Invoice.findByIdAndUpdate(id, {
                                    inv_date: req.body.invDate,
                                    date: req.body.date,
                                    payee: req.body.payee,
                                    expenses_type: req.body.expenseType,
                                    description: req.body.description,
                                    payment_type: req.body.paymentType,
                                    card_details: cDetails,
                                    month: req.body.forMonth,
                                    remarks: req.body.remarks,
                                    status: setStatus,
                                    amount: amount,
                                    updated_by: req.user.name

                                }, (err, result) => {
                                    if (err) {
                                        req.session.message = {
                                            type: 'danger',
                                            message: "Transaction cannot be save. Error: " + err,
                                        };
                                        res.redirect("/");
                                    } else {



                                        req.session.message = {
                                            type: 'transac',
                                            tType: 'invUpdate',
                                            message: 'Invoice has been successfully updated. Invoice No: ' + result.inv_no + ' Total Amount: QAR ' + amount,
                                            transID: result._id
                                        };
                                        res.redirect('/')

                                    }
                                });


                            }


                        }
                    });

                }
            })




        } else {
            res.redirect("/sign-in");
        }
    },

    viewPendingINV: async (req, res) => {
        if (req.isAuthenticated()) {

            if (req.user.role === 1) {

                Invoice.find({ status: 2 }, (err, resultINV) => {
                    if (err || !resultINV) {

                        req.session.message = {
                            type: 'danger',
                            message: "Pending expenses cannot view. Error: " + err,
                        };
                        res.redirect("/");

                    } else {

                        Notif.getINV((err, dataINV) => {
                            Notif.getVehicle((err, dataVehicle) => {
                                Notif.getVehicleIn((err, dataVehicleIn) => {
                                    Notif.getEmployee((err, dataEmployee) => {

                                        let nav = {
                                            title: "Notifications",
                                            child: "Pending Expenses",
                                            view: 2,
                                            notif: {
                                                exIstimara: dataVehicle,
                                                exInsurance: dataVehicleIn,
                                                expenPending: dataINV,
                                                exQID: dataEmployee
                                            }
                                        };

                                        res.render('pending-expenses', {
                                            title: "Expenses Approval List",
                                            nav: nav,
                                            pendingINV: resultINV

                                        })
                                    })
                                })
                            })
                        })

                    }
                })
            } else {
                res.redirect("/");
            }



        } else {
            res.redirect("/sign-in");
        }
    },

    saveApprovalInv: async (req, res) => {
        if (req.isAuthenticated()) {

            let id = req.params.id;

            if (req.user.role === 1) {
                Invoice.findByIdAndUpdate(id, {
                    status: + req.body.ans,
                    approval_rsn: req.body.reason_approval,
                    updated_by: req.user.name

                }, (err, result) => {
                    if (err) {
                        req.session.message = {
                            type: 'danger',
                            message: "Transaction cannot save. Error: " + err,
                        };
                        console.log(err)
                        res.redirect("/");
                    } else {

                        req.session.message = {
                            type: (parseInt(req.body.ans) === 1) ? 'success' : 'warning',
                            message: (parseInt(req.body.ans) === 1) ? `Invoice ${result.inv_no} approved!` : `Invoice ${result.inv_no} rejected!`
                        };

                        res.redirect("/pending-expenses");

                    }
                });
            } else {
                res.redirect("/");
            }


        } else {
            res.redirect("/sign-in");
        }
    },

}