const Company = require('../models/Company');
const Voucher = require('../models/Voucher');
const Invoice = require('../models/Invoice');
const Vehicles = require('../models/Vehicles');
const Notif = require('../middleware/notif.middleware');


module.exports = {

  viewDashboard: async (req, res) => {
    if (req.isAuthenticated()) {

      Invoice.find().sort({ createdAt: -1 }).lean().exec((err, foundInv) => {
        if (err) {
          res.json({ message: err.message, type: 'danger' });
        } else {

          Vehicles.find((errbill, vehicleFound) => {
            if (err) {
              res.json({ message: errbill.message, type: 'danger' });
            } else {

              Voucher.find((errbill, vouFound) => {
                if (err) {
                  res.json({ message: errbill.message, type: 'danger' });
                } else {

                  Notif.getINV((err, dataINV) => {
                    Notif.getVehicle((err, dataVehicle) => {
                    Notif.getVehicleIn((err, dataVehicleIn) => {
                      Notif.getEmployee((err, dataEmployee) => {

                        let nav = {
                          title: "Dashboard",
                          view: 2,
                          notif: {
                            exIstimara: dataVehicle,
                            exInsurance: dataVehicleIn,
                            expenPending: dataINV,
                            exQID: dataEmployee
                          }
                        };

                        res.render('index', {
                          title: "AL KATHIRI GROUPS ACCOUNTING",
                          nav: nav,
                          vehicleFound: vehicleFound,
                          vouFound: vouFound,
                          invItems: foundInv
                        })

                      })
                      })
                    })
                  })
                }
              })

            }
          });

        
        }
      })



    } else {
      res.redirect("/sign-in");
    }

  },

  ownerDashboard: async (req, res) => {
    if (req.isAuthenticated()) {

      Invoice.find().sort({ createdAt: -1 }).lean().exec((err, foundInv) => {
        if (err) {
          res.json({ message: err.message, type: 'danger' });
        } else {

          Vehicles.find((errbill, vehicleFound) => {
            if (err) {
              res.json({ message: errbill.message, type: 'danger' });
            } else {
              Company.find((errbill, CompanyFound) => {
                if (err) {
                  res.json({ message: errbill.message, type: 'danger' });
                } else {

                  Voucher.find((errbill, vouFound) => {
                    if (err) {
                      res.json({ message: errbill.message, type: 'danger' });
                    } else {
                      Notif.getINV((err, dataINV) => {
                        Notif.getVehicle((err, dataVehicle) => {
                        Notif.getVehicleIn((err, dataVehicleIn) => {
                          Notif.getEmployee((err, dataEmployee) => {
                            let nav = {
                              title: "Dashboard",
                              view: 1,
                              notif: {
                                exIstimara: dataVehicle,
                                exInsurance: dataVehicleIn,
                                expenPending: dataINV,
                                exQID: dataEmployee
                              }
                            };

                            res.render('owner-dashboard', {
                              title: "AL KATHIRI GROUPS ACCOUNTING",
                              nav: nav,
                              CompanyFound: CompanyFound,
                              vehicleFound: vehicleFound,
                              vouFound: vouFound,
                              invItems: foundInv
                            });

                          });
                        });
                      });
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
      res.redirect("/sign-in");
    }

  },
  companyDashboard: async (req, res) => {
    if (req.isAuthenticated()) {

      let companyId = req.params.id;

      Company.findById(companyId, (err, foundCompany) => {
        if (err) {
          res.json({ message: err.message, type: 'danger' });
        } else {

          req.session.user = {
            userName: req.user.name,
            userPosition: req.user.position,
            role: req.user.role,
            company: foundCompany.legal_name,
            companyID: foundCompany._id
          };


          res.redirect('/');
        }
      });

    } else {
      res.redirect("/sign-in");
    }

  }
}