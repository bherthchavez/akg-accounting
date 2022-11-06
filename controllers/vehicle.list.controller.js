
const Vehicles = require('../models/Vehicles');

module.exports = {

    addVehicle: async (req, res) => {
        if (req.isAuthenticated()) {


            const newVehicle = new Vehicles({
                vehicle_no: req.body.vehicleNo,
                make_model: req.body.makeModel,
                registered_owner: req.body.regOwner,
                registered_date: req.body.regDate,
                istimara_exdate: req.body.exDate,
                expenses: 0.0,
                income: 0.0,
                status: req.body.status,
                created_by: req.user.name,
            });
            newVehicle.save((err) => {
                if (err) {
                    res.json({ message: err.message, type: 'danger' });
                } else {
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

                    let nav = {
                        title: "Accounts",
                        child: "Vehicle"
                    };

                    res.render('vehicle-list', {
                        title: "Vehicle List",
                        vehicleList: foundVehicles,
                        nav: nav
                    })
                }
            });

        } else {
            res.redirect("/sign-in");
        }

    },

    updateVehicles: async (req, res) => {
        if (req.isAuthenticated()) {

            let id = req.params.id;

            Vehicles.findByIdAndUpdate(id, {
                vehicle_no: req.body.vehicleNo,
                make_model: req.body.makeModel,
                registered_owner: req.body.regOwner,
                registered_date: req.body.regDate,
                istimara_exdate: req.body.exDate,
                status: req.body.status
            }, (err, result) => {
                if (err) {
                    res.json({ message: err.message, type: 'danger' });
                } else {

                    req.session.message = {
                        type: 'success',
                        message: 'Vehicle updated successfully!'
                    };

                    res.redirect('/vehicle-list')
                }
            });

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

                        Vehicles.findByIdAndRemove(id, (err) => {

                            if (err) {
                                res.json({ message: err.message });
                            } else {
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

            Vehicles.findById(id, (err, result) => {
                if (err) {
                    res.json({ message: err.message });
                } else {

                    if (result.rented_info.length !=0) {

                        req.session.message = {
                            type: 'rentInfo',
                            id: result._id,
                            vehicleNo: result.vehicle_no,
                            voucherNo: result.rented_info[0].voucher_no,
                            date: result.rented_info[0].date,
                            month: result.rented_info[0].for_month,
                            particulars: result.rented_info[0].particulars,
                            rent: result.rented_info[0].total_rent,
                            bills: result.rented_info[0].total_bills,
                            received: result.rented_info[0].cash_received
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

            Vehicles.findOneAndUpdate({_id: id}, {$unset : {rented_info:[]}, status: 'Available'}, (err, foundList)=>{
            
                if (err) {
                    res.json({ message: err.message });
                } else {
                    res.redirect('/vehicle-list')
                }
            });

        } else {
            res.redirect("/sign-in");
        }
    }


}