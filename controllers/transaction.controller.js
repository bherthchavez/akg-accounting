const Income = require('../models/income');
const Vehicles = require('../models/Vehicles');

module.exports = {

    createIncome : async (req, res)=>{
        if (req.isAuthenticated()){

            let id = req.params.id
              
            Vehicles.findById(id, (err, foundItem)=>{
                  if (err){
                      res.json({message: err.message, type: 'danger'});
                  }else{

                    Vehicles.find().exec((err, foundVehicles)=>{
                          let nav = {
                              title: "Accounts",
                              child: "Vehicle"
                          };

                          res.render('create-income', {title: "Create Transaction Income",
                              nav: nav,
                              foundVehicles:foundVehicles, 
                              vehicleNo: foundItem.vehicle_no, 
                              
                                });
                      });
                  }
              });
                    

        }else{
            res.redirect("/sign-in");
        } 
    },

    createExpenses : async (req, res)=>{
        if (req.isAuthenticated()){

        }else{
            res.redirect("/sign-in");
        } 
    }
}