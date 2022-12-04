
const CostCenter = require('../models/CostCenter');
const ChartOfAccounts = require('../models/ChartOfAccount');
const Settings = require('../models/Settings');
const PurposeTransfer = require('../models/PurposeTransfer');
const LoginHistory = require('../models/LoginHistory');
const Invoice = require('../models/Invoice');
const Voucher = require('../models/Voucher');
const Vehicles = require('../models/Vehicles');
const Notif = require('../middleware/notif.middleware');
const fs = require('fs');
const path = require('path');

let alertSetVou;
let alertSetInv;
let alertSetOther;


module.exports = {

    //--------------------------------------------------------ACCOUNT LEDGER SETTINGS //
    viewChartAcc: async (req, res) => {
        if (req.isAuthenticated()) {

            PurposeTransfer.find().exec((err, purposeFoundItems) => {

                if (err) {

                    res.json({ message: err.message });

                } else {

                    CostCenter.find().exec((err, costFoundItems) => {

                        if (err) {

                            res.json({ message: err.message });

                        } else {

                            ChartOfAccounts.find().exec((err, chartFoundItems) => {

                                if (err) {

                                    res.json({ message: err.message });

                                } else {

                                    Notif.getINV((err, dataINV) => {
                                        Notif.getVehicle((err, dataVehicle) => {
                                            Notif.getVehicleIn((err, dataVehicleIn) => {
                                                Notif.getEmployee((err, dataEmployee) => {


                                                    let nav = {
                                                        title: "Settings",
                                                        child: "Master",
                                                        view: 2,
                                                        notif: {
                                                            exIstimara: dataVehicle,
                                                            exInsurance: dataVehicleIn,
                                                            expenPending: dataINV,
                                                            exQID: dataEmployee
                                                        }
                                                    };

                                                    res.render('account-ledger', {
                                                        title: "Settings - Account Ledger",
                                                        nav: nav,
                                                        chartFoundItems: chartFoundItems,
                                                        purposeFoundItems: purposeFoundItems,
                                                        costFoundItems: costFoundItems,
                                                    })
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

    addChartAcc: async (req, res) => {
        if (req.isAuthenticated()) {

            const cc = new ChartOfAccounts({
                name: req.body.ledgerName,
                code: req.body.ledgerCode,
                created_by: req.user.name,
                updated_at: Date.now()
            });
            cc.save((err) => {
                if (err) {
                    res.json({ message: err.message, type: 'danger' });
                } else {
                    req.session.message = {
                        type: 'success',
                        message: 'Account ledger added successfully!',
                    };
                    res.redirect('/master');
                }
            });

        } else {
            res.redirect("/sign-in");
        }

    },

    updateChartAcc: async (req, res) => {
        if (req.isAuthenticated()) {

            let id = req.params.id;

            ChartOfAccounts.findByIdAndUpdate(id, {
                name: req.body.ledgerName,
                code: req.body.ledgerCode,
                updated_at: Date.now()
            }, (err, result) => {
                if (err) {
                    res.json({ message: err.message, type: 'danger' });
                } else {
                    req.session.message = {
                        type: 'success',
                        message: 'Account ledger updated successfully!'
                    };

                    res.redirect('/master')
                }
            });

        } else {
            res.redirect("/sign-in");
        }
    },

    deleteChartAcc: async (req, res) => {
        if (req.isAuthenticated()) {

            let id = req.params.id

            ChartOfAccounts.findByIdAndRemove(id, (err, result) => {

                if (err) {
                    res.json({ message: err.message });
                } else {
                    req.session.message = {
                        type: 'success',
                        message: 'Account ledger deleted successfully!',
                    };
                    res.redirect('/master')
                }

            });

        } else {
            res.redirect("/sign-in");
        }
    },
    //-------------------------------------------------------- COST CENTER SETTINGS //
    viewCostCenter: async (req, res) => {
        if (req.isAuthenticated()) {

            PurposeTransfer.find().exec((err, purposeFoundItems) => {

                if (err) {

                    res.json({ message: err.message });

                } else {

                    CostCenter.find().exec((err, costFoundItems) => {

                        if (err) {

                            res.json({ message: err.message });

                        } else {

                            ChartOfAccounts.find().exec((err, chartFoundItems) => {

                                if (err) {

                                    res.json({ message: err.message });

                                } else {

                                    Notif.getINV((err, dataINV) => {
                                        Notif.getVehicle((err, dataVehicle) => {
                                            Notif.getVehicleIn((err, dataVehicleIn) => {
                                                Notif.getEmployee((err, dataEmployee) => {


                                                    let nav = {
                                                        title: "Settings",
                                                        child: "Master",
                                                        view: 2,
                                                        notif: {
                                                            exIstimara: dataVehicle,
                                                            exInsurance: dataVehicleIn,
                                                            expenPending: dataINV,
                                                            exQID: dataEmployee
                                                        }
                                                    };

                                                    res.render('cost-center', {
                                                        title: "Settings - Cost Center",
                                                        nav: nav,
                                                        chartFoundItems: chartFoundItems,
                                                        purposeFoundItems: purposeFoundItems,
                                                        costFoundItems: costFoundItems,
                                                    })
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

    addCostCenter: async (req, res) => {
        if (req.isAuthenticated()) {

            const cc = new CostCenter({
                cost_center: req.body.costCenter,
                code: req.body.cCcode,
                created_by: req.user.name,
                updated_at: Date.now()
            });
            cc.save((err) => {
                if (err) {
                    res.json({ message: err.message, type: 'danger' });
                } else {
                    req.session.message = {
                        type: 'success',
                        message: 'Cost center added successfully!',
                    };
                    res.redirect('/cost-center');
                }
            });

        } else {
            res.redirect("/sign-in");
        }

    },

    updateCostCenter: async (req, res) => {
        if (req.isAuthenticated()) {

            let id = req.params.id;

            CostCenter.findByIdAndUpdate(id, {
                cost_center: req.body.costCenter,
                code: req.body.cCcode,
                updated_at: Date.now()
            }, (err, result) => {
                if (err) {
                    res.json({ message: err.message, type: 'danger' });
                } else {
                    req.session.message = {
                        type: 'success',
                        message: 'Cost center updated successfully!'
                    };

                    res.redirect('/cost-center')
                }
            });

        } else {
            res.redirect("/sign-in");
        }
    },

    deleteCostCenter: async (req, res) => {
        if (req.isAuthenticated()) {

            let id = req.params.id

            CostCenter.findByIdAndRemove(id, (err, result) => {

                if (err) {
                    res.json({ message: err.message });
                } else {
                    req.session.message = {
                        type: 'success',
                        message: 'Cost center deleted successfully!',
                    };
                    res.redirect('/cost-center')
                }

            });

        } else {
            res.redirect("/sign-in");
        }
    },
    //-------------------------------------------------------- Purpose Transfer SETTINGS //
    viewPurpose: async (req, res) => {
        if (req.isAuthenticated()) {

            PurposeTransfer.find().exec((err, purposeFoundItems) => {

                if (err) {

                    res.json({ message: err.message });

                } else {

                    CostCenter.find().exec((err, costFoundItems) => {

                        if (err) {

                            res.json({ message: err.message });

                        } else {

                            ChartOfAccounts.find().exec((err, chartFoundItems) => {

                                if (err) {

                                    res.json({ message: err.message });

                                } else {

                                    Notif.getINV((err, dataINV) => {
                                        Notif.getVehicle((err, dataVehicle) => {
                                            Notif.getVehicleIn((err, dataVehicleIn) => {
                                                Notif.getEmployee((err, dataEmployee) => {


                                                    let nav = {
                                                        title: "Settings",
                                                        child: "Master",
                                                        view: 2,
                                                        notif: {
                                                            exIstimara: dataVehicle,
                                                            exInsurance: dataVehicleIn,
                                                            expenPending: dataINV,
                                                            exQID: dataEmployee

                                                        }
                                                    };

                                                    res.render('transfer-purpose', {
                                                        title: "Settings - Transfer Purpose",
                                                        nav: nav,
                                                        chartFoundItems: chartFoundItems,
                                                        purposeFoundItems: purposeFoundItems,
                                                        costFoundItems: costFoundItems,
                                                    })
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
            res.redirect("/sign-in")
        }
    },

    addPurpose: async (req, res) => {
        if (req.isAuthenticated()) {

            const purpose = new PurposeTransfer({
                purpose: req.body.purpose,
                code: req.body.purposeCode,
                created_by: req.user.name,
                updated_at: Date.now()
            });
            purpose.save((err) => {
                if (err) {
                    res.json({ message: err.message, type: 'danger' });
                } else {
                    req.session.message = {
                        type: 'success',
                        message: 'Transfer purpose added successfully!',
                    };
                    res.redirect('/purpose-transfer');
                }
            });

        } else {
            res.redirect("/sign-in");
        }

    },

    updatePurpose: async (req, res) => {
        if (req.isAuthenticated()) {

            let id = req.params.id;

            PurposeTransfer.findByIdAndUpdate(id, {
                purpose: req.body.purpose,
                code: req.body.purposeCode,
                updated_at: Date.now()
            }, (err, result) => {
                if (err) {
                    res.json({ message: err.message, type: 'danger' });
                } else {
                    req.session.message = {
                        type: 'success',
                        message: 'Transfer purpose updated successfully!'
                    };

                    res.redirect('/purpose-transfer')
                }
            });

        } else {
            res.redirect("/sign-in");
        }
    },

    deletePurpose: async (req, res) => {
        if (req.isAuthenticated()) {

            let id = req.params.id

            PurposeTransfer.findByIdAndRemove(id, (err, result) => {

                if (err) {
                    res.json({ message: err.message });
                } else {
                    req.session.message = {
                        type: 'success',
                        message: 'Transfer purpose deleted successfully!',
                    };
                    res.redirect('/purpose-transfer')
                }

            });

        } else {
            res.redirect("/sign-in");
        }
    },
    //--------------------------------------------------------  SYSTEM SETTINGS //
    viewSysSettings: async (req, res) => {
        if (req.isAuthenticated()) {
          
            Settings.find({}, (err, foundItems) => {
                if (err) {
                    res.json({ message: err.message });
                } else {
                    Notif.getINV((err, dataINV) => {
                        Notif.getVehicle((err, dataVehicle) => {
                            Notif.getVehicleIn((err, dataVehicleIn) => {
                                Notif.getEmployee((err, dataEmployee) => {

                                    let nav = {
                                        title: "Settings",
                                        child: "System Settings",
                                        view: 2,
                                        notif: {
                                            exIstimara: dataVehicle,
                                            expenPending: dataINV,
                                            exInsurance: dataVehicleIn,
                                            exQID: dataEmployee
                                        }
                                    };

                                    let settingsAlert = {
                                        alertSetVou: alertSetVou,
                                        alertSetInv: alertSetInv,
                                        alertSetOther: alertSetOther
                                    }


                                    res.render('system-settings', {
                                        title: "Settings - System Settings",
                                        nav: nav,
                                        settingsAlert: settingsAlert,
                                        foundSettings: foundItems
                                    })

                                    alertSetVou = 0;
                                    alertSetInv = 0;
                                    alertSetOther= 0;
                                })
                            })
                        })
                    })




                }
            })




        } else {
            res.redirect("/sign-in")
        }
    },

    updateSysSettings: async (req, res) => {
        if (req.isAuthenticated()) {

            Settings.findOneAndUpdate({ name: "expenses_settings" },
                {
                    $set: {
                        value: + req.body.expensesAmout,
                        updated_by: req.user.name
                    }
                }, (err) => {
                    if (err) {
                        res.json({ message: err.message });
                    } else {

                        alertSetOther = 1

                        Settings.findOneAndUpdate({ name: "documents_settings" },
                            {
                                $set: {
                                    value: + req.body.docsNotif,
                                    updated_by: req.user.name
                                }
                            }, (err) => {
                                if (err) {
                                    res.json({ message: err.message });
                                } else {

                                    let voucherNo = req.body.vouPrefix + req.body.vouStartingNo;
                                    let invNo = req.body.invPrefix + req.body.invStartingNo;

                                    if (parseFloat(req.body.actualVouStartingNo) <= parseFloat(req.body.vouStartingNo)) {

                                        Voucher.find({ voucher_no: voucherNo }, (err, vouFound) => {
                                            if (err) {
                                                res.json({ message: err.message });
                                            } else {


                                                if (vouFound.length === 0) {

                                                    Settings.findOneAndUpdate({ _id: req.body.vouID },
                                                        {
                                                            $set: {
                                                                prefix: req.body.vouPrefix,
                                                                starting_no: req.body.vouStartingNo
                                                            }
                                                        }, (err) => {
                                                            if (err) {
                                                                res.json({ message: err.message });
                                                            } else {
                                                                alertSetVou = 1;
                                                            }

                                                        });

                                                } else {

                                                    alertSetVou = 2;
                                                }
                                            }
                                        });

                                    } else {
                                        alertSetVou = 3;
                                    }

                                    if (parseFloat(req.body.actualInvStartingNo) <= parseFloat(req.body.invStartingNo)) {


                                        Invoice.find({ inv_no: invNo }, (err, payVouBill) => {
                                            if (err) {
                                                res.json({ message: err.message });
                                            } else {

                                                if (payVouBill.length === 0) {

                                                    Settings.findOneAndUpdate({ _id: req.body.invID },
                                                        {
                                                            $set: {
                                                                prefix: req.body.invPrefix,
                                                                starting_no: req.body.invStartingNo
                                                            }
                                                        }, (err2) => {
                                                            if (err2) {
                                                                res.json({ message: err.message });
                                                            } else {
                                                                alertSetInv = 1;
                                                            }
                                                        });

                                                } else {
                                                    alertSetInv = 2;
                                                }
                                            }
                                        });

                                    } else {

                                        alertSetInv = 3;
                                    }
                                    res.redirect('/system-settings');



                                }

                            });

                    }

                });

        } else {
            res.redirect("/sign-in");
        }
    },

    viewHima: async (req, res) => {
        if (req.isAuthenticated()) {

            if (req.user.userRole === 'Hokage') {

                PaymentVoucher.find().exec((err, voucherFound) => {

                    if (err) {

                        res.json({ message: err.message });

                    } else {

                        SupplierBill.find().exec((err, billFound) => {

                            if (err) {

                                res.json({ message: err.message });

                            } else {
                                LoginHistory.find().sort({ login_at: -1 }).exec((err, userlogsFound) => {

                                    if (err) {

                                        res.json({ message: err.message });

                                    } else {

                                        Invoice.find({ status: 2 }, (err, fexpenPending) => {
                                            if (err) {
                                                res.json({ message: err.message, type: 'danger' });

                                            } else {
                                                Vehicles.find({ istimara_exdate: { $lte: new Date(new Date().setDate(new Date().getDate() + 1)) } }, (err, foundExIstimara) => {
                                                    if (err) {
                                                        return res.json({ message: err.message, type: 'danger' });
                                                    } else {

                                                        let nav = {
                                                            title: "",
                                                            child: "",
                                                            view: 2,
                                                            notif: {
                                                                exIstimara: foundExIstimara,
                                                                expenPending: fexpenPending
                                                            }
                                                        };

                                                        res.render('hima-the-hokage', {
                                                            title: "Settings -For Hima",
                                                            nav: nav,
                                                            userlogsFound: userlogsFound,
                                                            voucherFound: voucherFound,
                                                            billFound: billFound,
                                                        });

                                                    }
                                                });
                                            }
                                        });


                                    }
                                });
                            }
                        });
                    }
                });

            } else {
                res.redirect('/');
            }

        } else {
            res.redirect("/sign-in");
        }
    },

    downloadHima: async (req, res) => {
        if (req.isAuthenticated()) {

            if (req.user.userRole === 'Hokage') {
                const filePath = path.join(__dirname, '../public/attachment/' + req.params.filename);

                res.download(
                    filePath,
                    req.params.filename, // Remember to include file extension

                    (err) => {

                        if (err) {

                            res.json({ message: err.message });

                        }

                    });

            } else {
                res.redirect('/');
            }

        } else {
            res.redirect("/sign-in");
        }
    },

    deleteHima: async (req, res) => {
        if (req.isAuthenticated()) {

            if (req.user.userRole === 'Hokage') {

                const filePath = path.join(__dirname, '../public/attachment/' + req.params.filename);

                fs.unlink(filePath, (err) => {
                    if (err) {
                        res.json({ message: err.message });
                    } else {

                        req.session.message = {
                            type: 'success',
                            message: 'Attachmen deleted!',
                        };
                        res.redirect('/hima-the-hokage')
                    }

                    //file removed
                })


            } else {
                res.redirect('/');
            }

        } else {
            res.redirect("/sign-in");
        }
    },

    err404: async (req, res) => {
        if (req.isAuthenticated()) {
            res.render('error-404')

        } else {
            res.redirect("/sign-in");
        }

    },


}