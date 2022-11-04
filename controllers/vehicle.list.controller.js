
const Vehicles = require('../models/Vehicles');

module.exports = {

    addVehicle : async (req, res) =>{
        if (req.isAuthenticated()){


                const newVehicle = new Vehicles({
                    vehicle_no: req.body.vehicleNo,
                    make_model: req.body.makeModel,
                    registered_owner: req.body.regOwner,
                    registered_date: req.body.regDate,
                    expenses: 0.0,
                    income: 0.0,
                    status: req.body.status,
                    created_by: req.user.name,
                });
                newVehicle.save((err)=>{
                    if(err){
                        res.json({message: err.message, type: 'danger'});
                    }else{
                        req.session.message = {
                            type: 'success',
                            message: 'Vehicle added successfully!',
                        };
                        res.redirect('/vehicle-list');
                    }
                });

        }else{
            res.redirect("/sign-in");
        }
    },

    viewVehicles: async (req, res)=>{
        if (req.isAuthenticated()){

            Vehicles.find().exec((err, foundVehicles)=>{
                    if(err){
                        res.json({message: err.message});
                    }else{

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

        }else{
            res.redirect("/sign-in");
        }   

    },

    updateVehicles: async (req, res)=>{
        if (req.isAuthenticated()){

            let id = req.params.id;

            Vehicles.findByIdAndUpdate(id, {
                vehicle_no: req.body.vehicleNo,
                make_model: req.body.makeModel,
                registered_owner: req.body.regOwner,
                registered_date: req.body.regDate,
                status: req.body.status
            }, (err, result)=>{
                if(err){
                    res.json({message: err.message, type: 'danger'});
                }else{
                    req.session.message = {
                        type: 'success',
                        message: 'Vehicle updated successfully!'
                    };
                
                    res.redirect('/vehicle-list')
                }
            });

        }else{
            res.redirect("/sign-in");
        } 
    },

    deleteVehicle : async (req, res)=>{
        if (req.isAuthenticated()){

            let id = req.params.id

            Vehicles.findById(id, (err, result)=>{
                if(err){
                    res.json({message: err.message});
                }else{

                    if (result.income === 0 && result.expenses === 0){

                        Vehicles.findByIdAndRemove(id, (err)=>{
                            
                            if(err){
                                res.json({message: err.message});
                            }else{
                                req.session.message = {
                                    type: 'info',
                                    message: 'Vehicles deleted successfully!',
                                };
                                res.redirect('/vehicle-list')
                            }

                        });

                    }else{

                        req.session.message = {
                            type: 'danger',
                            message: result.supplier_name + ': cannot not be deleted since it has one or more entries and still present!',
                        };
                        res.redirect('/vehicle-list')

                    }

                    }

            });

        }else{
            res.redirect("/sign-in");
        } 
    }

}