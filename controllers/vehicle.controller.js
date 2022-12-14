const { s3Upload, s3Delete, s3Download } = require('../middleware/s3Service.middleware')
const Vehicles = require('../models/Vehicles');
const Voucher = require('../models/Voucher');

const Notif = require('../middleware/notif.middleware');

module.exports = {

    addVehicle: (req, res) => {

        if (req.isAuthenticated()) {
            const newVehicle = new Vehicles({
                vehicle_no: req.body.vehicleNo,
                make_model: req.body.makeModel,
                registered_owner: req.body.regOwner,
                registered_date: req.body.regDate,
                istimara_exdate: req.body.exDate,
                istimara_file: `${req.files['istimaraFile'][0].fieldname}-${req.body.vehicleNo}-${req.files['istimaraFile'][0].originalname}`,
                insurance_exdate: req.body.exDateIn,
                insurance_file: `${req.files['insuranceFile'][0].fieldname}-${req.body.vehicleNo}-${req.files['insuranceFile'][0].originalname}`,
                expenses: 0.0,
                income: 0.0,
                status: 1,
                created_by: req.user.name,
            });
            newVehicle.save(async (err, result) => {
                if (err) {
                    res.json({ message: err.message, type: 'danger' });
                } else {

                    const s3UpIs = await s3Upload(req.files['istimaraFile'][0], req.body.vehicleNo, 'vehicle');
                    const s3UpIn = await s3Upload(req.files['insuranceFile'][0], req.body.vehicleNo, 'vehicle');

                    req.session.message = {
                        type: 'success',
                        message: 'Vehicle added successfully!',
                    };
                    res.redirect('/vehicle-list');
                }
            });

        } else {
            res.redirect("/sign-in");
        }
    },

    viewVehicles: async (req, res) => {
        if (req.isAuthenticated()) {

            Vehicles.find().exec((err, foundVehicles) => {
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

                                    res.render('vehicle', {
                                        title: "Vehicle List",
                                        vehicleList: foundVehicles,
                                        nav: nav
                                    })

                                });
                            });
                        });
                    });


                }
            });

        } else {
            res.redirect("/sign-in");
        }

    },

    updateVehicles: async (req, res) => {
        if (req.isAuthenticated()) {



            let id = req.params.id;

            Vehicles.findById(id, (err, vResult) => {
                if (err) {
                    res.json({ message: err.message });
                } else {


                    Vehicles.findByIdAndUpdate(id, {
                        vehicle_no: req.body.vehicleNo,
                        make_model: req.body.makeModel,
                        registered_owner: req.body.regOwner,
                        registered_date: req.body.regDate,
                        istimara_exdate: req.body.exDate,
                        insurance_exdate: req.body.exDateIn
                    }, async (err, result) => {
                        if (err) {
                            res.json({ message: err.message, type: 'danger' });
                        } else {

                            if (req.files['istimaraFile']) { // new istimara

                                const S3up = await s3Upload(req.files['istimaraFile'][0], req.body.vehicleNo,'vehicle');

                                Vehicles.findByIdAndUpdate(id, {
                                    istimara_file: `${req.files['istimaraFile'][0].fieldname}-${req.body.vehicleNo}-${req.files['istimaraFile'][0].originalname}`
                                }, async (err) => {
                                    if (err) {

                                        res.json({ message: err.message });
                                    } else {
                                        const S3del = await s3Delete(vResult.istimara_file,'vehicle')
                                    }
                                })

                            }

                            if (req.files['insuranceFile']) { // new  insurance
                                const S3up = await s3Upload(req.files['insuranceFile'][0], req.body.vehicleNo,'vehicle');

                                Vehicles.findByIdAndUpdate(id, {
                                    insurance_file: `${req.files['insuranceFile'][0].fieldname}-${req.body.vehicleNo}-${req.files['insuranceFile'][0].originalname}`
                                }, async (err) => {
                                    if (err) {

                                        res.json({ message: err.message });
                                    } else {
                                        const S3del = await s3Delete(vResult.insurance_file,'vehicle')
                                    }
                                })

                            }

                            req.session.message = {
                                type: 'success',
                                message: 'Vehicle updated successfully!'
                            };

                            res.redirect('/vehicle-list')
                        }
                    });
                }
            })




        } else {
            res.redirect("/sign-in");
        }
    },

    deleteVehicle: async (req, res) => {
        if (req.isAuthenticated()) {

            let id = req.params.id

            Vehicles.findById(id, (err, result) => {
                if (err) {
                    res.json({ message: err.message });
                } else {

                    if (result.income === 0 && result.expenses === 0) {

                        Vehicles.findByIdAndRemove(id, async (err, foundDeleted) => {

                            if (err) {
                                res.json({ message: err.message });
                            } else {

                                // delete file  istimara
                                const s3Del = await s3Delete(foundDeleted.istimara_file,'vehicle')

                                // delete file  insurance
                                const s3Del1 = await s3Delete(foundDeleted.insurance_file,'vehicle')



                                req.session.message = {
                                    type: 'info',
                                    message: 'Vehicles deleted successfully!',
                                };
                                res.redirect('/vehicle-list')
                            }

                        });

                    } else {

                        req.session.message = {
                            type: 'danger',
                            message: result.supplier_name + ': cannot not be deleted since it has one or more entries and still present!',
                        };
                        res.redirect('/vehicle-list')

                    }

                }

            });

        } else {
            res.redirect("/sign-in");
        }
    },

    viewRentInfo: async (req, res) => {
        if (req.isAuthenticated()) {

            let id = req.params.id

            const voucherNo = req.body.voucherNo

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
                            status: result.status
                        };

                        res.redirect('/vehicle-list')

                    } else {

                        res.redirect('/vehicle-list')
                    }
                }
            });

        } else {
            res.redirect("/sign-in");
        }
    },

    returnVehicle: async (req, res) => {
        if (req.isAuthenticated()) {

            let id = req.params.id

            Voucher.findOne({ _id: id }, (err, foundVoucher) => {
                if (err) {
                    res.json({ message: err.message });
                } else {

                    let nav = {
                        title: "Accounts",
                        child: "Vehicle",
                        view: 2
                    };

                    res.render('return-vehicle', {
                        title: "Return Vehicle",
                        VoucherFound: foundVoucher,
                        nav: nav
                    })
                }
            });

        } else {
            res.redirect("/sign-in");
        }
    },

    returnSave: async (req, res) => {
        if (req.isAuthenticated()) {

            let id = req.params.id;

            Voucher.findByIdAndUpdate(id, {
                total_rent: req.body.totalRent1,
                total_bills: req.body.totalBills,
                cash_received: req.body.cashReceived,
                status: + req.body.status
            }, (err, result) => {
                console.log(req.body)
                if (err) {
                    res.json({ message: err.message, type: 'danger' });
                } else {

                    Vehicles.findOneAndUpdate({ _id: req.body.vehicleID }, { $unset: { rented_info: [] }, status: 'Available' }, (err, foundList) => {
                        console.log(foundList)
                        if (err) {
                            res.json({ message: err.message, type: 'danger' });
                        } else {

                            req.session.message = {
                                type: 'transac',
                                tType: 'return',
                                message: 'Voucher for vehicle no. ' + req.body.vehicleNo + ' has been successfully return. Voucher No: ' + req.body.vouNo + ' Total Amount: QAR ' + req.body.totalRent
                            };
                            res.redirect('/vehicle-list')
                        }
                    });
                }
            });

        } else {
            res.redirect("/sign-in");
        }
    },

    dlAttachment: async (req, res) => {
        if (req.isAuthenticated()) {

            res.attachment(req.params.filename);
            const fileStream = await s3Download(req.params.filename, 'vehicle');
            fileStream.pipe(res);

        } else {
            res.redirect("/sign-in");
        }
    },


}