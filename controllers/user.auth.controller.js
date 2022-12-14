const User = require('../models/User');
const LoginHistory = require('../models/LoginHistory');
const passport = require("passport");
const ip = require('ip');


passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


const LocalStrategy = require('passport-local').Strategy;
passport.use(new LocalStrategy(User.authenticate()));

module.exports = {

  signIn: async (req, res) => {

    res.render('sign-in', {
      title: "Sign In User",
      alert: 0

    })

  },

  checkUser: async (req, res) => {

    const user = new User({
      username: req.body.username,
      password: req.body.password
    });

    req.login(user, (err) => {
      if (err) {
        res.json({ message: err.message, type: 'danger' });

      } else {
        req.session.message = {
          message: "Incorrect login credential",
          type: "warning"
        };

        passport.authenticate("local", { failureRedirect: '/sign-in' })(req, res, () => {

          if (req.user.userRole != 'Hokage') {

            const logs = new LoginHistory({
              name: req.user.name,
              user_name: req.body.username,
              id_address: ip.address(),
              id_address2: req.connection.remoteAddress,
              status: "Success"
            });
            logs.save((err) => {
              if (err) {
                res.json({ message: err.message, type: 'danger' });
              }
            });
          }

          console.log(`User Login! Ip: ${req.connection.remoteAddress} Name: ${req.user.name}` )

          req.session.user = {
            userName: req.user.name,
            userPosition: req.user.position,
            role: req.user.role,
            company: req.user.company,
            company_id: req.user.company_id
          };

          (req.user.role === 1) ? res.redirect("/owner-dashboard") : res.redirect("/");


       
                        

       
          
        });

      }
    });

  },

  logoutUser: async (req, res) => {

    req.logout((err) => {
      if (err) { return next(err); }
      res.redirect('/');
    });

  }


}