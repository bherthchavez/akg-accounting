const Company = require('../models/Company');
const Voucher = require('../models/Voucher');
const User = require('../models/User');
const Invoice = require('../models/Invoice');
const Vehicles = require('../models/Vehicles');
const passport = require("passport");
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


const LocalStrategy = require('passport-local').Strategy;
passport.use(new LocalStrategy(User.authenticate()));



module.exports = {

  companySetup: async (req, res) => {
    if (req.isAuthenticated()) {


      Company.find().exec((err, foundList) => {
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
                    title: "Setup",
                    view: 1,
                    notif: {
                      exIstimara: foundExIstimara,
                      expenPending: fexpenPending
                    }
                  };
                  res.render('company', {
                    title: "Company Setup",
                    nav: nav,
                    companyList: foundList
                  })

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

  addCompany: async (req, res) => {
    if (req.isAuthenticated()) {


      const newCompany = new Company({
        legal_name: req.body.legalName,
        commercial_name: req.body.commName,
        email: req.body.email,
        phone: req.body.phone,
        address: req.body.address,
        created_by: req.user.name
      });
      newCompany.save((err) => {
        if (err) {
          res.json({ message: err.message, type: 'danger' });
        } else {
          req.session.message = {
            type: 'success',
            message: 'New Company added successfully!',
          };
          res.redirect('/company-setup');
        }
      });

    } else {
      res.redirect("/sign-in");
    }

  },

  updateCompany: async (req, res) => {
    if (req.isAuthenticated()) {
      let id = req.params.id;

      Company.findByIdAndUpdate(id, {
        legal_name: req.body.legalName,
        commercial_name: req.body.commName,
        email: req.body.email,
        phone: req.body.phone,
        address: req.body.address
      }, (err, result) => {
        if (err) {
          res.json({ message: err.message, type: 'danger' });
        } else {

          req.session.message = {
            type: 'success',
            message: 'Company updated successfully!'
          };

          res.redirect('/company-setup')
        }
      });

    } else {
      res.redirect("/sign-in");
    }

  },

  deleteCompany: async (req, res) => {
    if (req.isAuthenticated()) {

      let id = req.params.id

      Voucher.find({ company_id: id }, (err, result) => {
        if (err) {
          res.json({ message: err.message });
        } else {
          if (result.length === 0) {

            Company.findByIdAndRemove(id, (err) => {

              if (err) {
                res.json({ message: err.message });
              } else {
                req.session.message = {
                  type: 'info',
                  message: 'Company deleted successfully!',
                };
                res.redirect('/company-setup')
              }

            });

          } else {

            req.session.message = {
              type: 'danger',
              message: 'Thi Company cannot not be deleted since it has one or more entries and still present!',
            };
            res.redirect('/company-setup')

          }

        }

      });

    } else {
      res.redirect("/sign-in");
    }
  },

  devRegister: async (req, res) => {
    res.render('register')

  },
  userSetup: async (req, res) => {
    if (req.isAuthenticated()) {
      User.find().exec((err, foundList) => {
        if (err) {
          res.json({ message: err.message });
        } else {

          Company.find().exec((err, foundCompany) => {
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
                        title: "User",
                        view: 1,
                        notif: {
                          exIstimara: foundExIstimara,
                          expenPending: fexpenPending
                        }
                      };
                      res.render('user', {
                        title: "User Setup",
                        nav: nav,
                        userList: foundList,
                        foundCompany: foundCompany
                      })

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

  addUserDev: async (req, res) => {
    const name = req.body.name
    const username = req.body.username
    const email = req.body.email
    const company = req.body.company
    const position = req.body.position
    const role = + req.body.role
    const status = + req.body.status
    const password = req.body.password



    User.register(new User({
      name: name,
      username: username,
      email: email,
      company: company,
      company_id: 123131,
      position: position,
      role: role,
      status: status,
      created_by: 'hima'
    }), password, (err, user) => {
      if (err) {


        console.log("Your account could not be saved. Error: " + err,)

        res.redirect("/user-setup");
      } else {
        console.log('New user account added successfully!')
        res.redirect("/");
      }

    });
  },

  addUser: async (req, res) => {
    if (req.isAuthenticated()) {



      const name = req.body.name
      const username = req.body.username
      const email = req.body.email
      const companyId = req.body.company
      const position = req.body.position
      const role = + req.body.role
      const status = + req.body.status
      const password = req.body.password

      Company.findById({ _id: companyId }).exec((err, foundCompany) => {

        if (err) {

          req.session.message = {
            type: 'danger',
            message: "Your account could not be saved. Error: " + err,
          };
          res.redirect("/user-setup");
        } else {

          User.register(new User({
            name: name,
            username: username,
            email: email,
            company: foundCompany.commercial_name,
            company_id: companyId,
            position: position,
            role: role,
            status: status,
            created_by: req.user.name
          }), password, (err, user) => {
            if (err) {

              req.session.message = {
                type: 'danger',
                message: "Your account could not be saved. Error: " + err,
              };
              res.redirect("/user-setup");
            } else {
              req.session.message = {
                type: 'success',
                message: 'New user account added successfully!',
              };
              res.redirect("/user-setup");
            }

          });
        }
      })


    } else {
      res.redirect("/sign-in");
    }

  },

  updateUser: async (req, res) => {
    if (req.isAuthenticated()) {

      let id = req.params.id;
      const companyId = req.body.company

      Company.findOne({ _id: companyId }).exec((err, foundCompany) => {

        if (err) {
          req.session.message = {
            type: 'danger',
            message: "User1 account could not be saved. Error: " + err,
          };
          res.redirect("/user-setup");
        } else {

          User.findByIdAndUpdate(id, {
            name: req.body.name,
            username: req.body.commName,
            email: req.body.email,
            company: foundCompany.commercial_name,
            company_id: companyId,
            position: req.body.position,
            role: + req.body.role,
            status: + req.body.status,
            created_by: req.user.name
          }, (err, result) => {
            if (err) {
              req.session.message = {
                type: 'danger',
                message: "User2 account could not be saved. Error: " + err,
              };
              res.redirect("/user-setup");
            } else {

              req.session.message = {
                type: 'success',
                message: 'User account updated successfully!'
              };

              res.redirect('/user-setup')
            }
          });
        }
      })

    } else {
      res.redirect("/sign-in");
    }

  },

  changePassUser: async (req, res) => {
    if (req.isAuthenticated()) {

      if (req.body.password === req.body.newPassword) {
        User.findByUsername(req.body.username).then(function (sanitizedUser) {
          if (sanitizedUser) {
            sanitizedUser.setPassword(req.body.password, function () {
              sanitizedUser.save();

              req.session.message = {
                type: 'success',
                message: 'Password successfully change.'
              };

              res.redirect('/user-setup')
            });
          } else {
            req.session.message = {
              type: 'danger',
              message: 'User does not exist.'
            };

            res.redirect('/user-setup')
          }
        }, function (err) {
          req.session.message = {
            type: 'danger',
            message: err
          };

          res.redirect('/user-setup')
        })



      } else {

        req.session.message = {
          type: 'danger',
          message: 'Password does not match! Please try again.'
        };

        res.redirect('/user-setup')

      }



    } else {
      res.redirect("/sign-in");
    }

  },
}