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
              id_address2: req.ip,
              status: "Success",
              updated_at: Date.now()
            });
            logs.save((err) => {
              if (err) {
                res.json({ message: err.message, type: 'danger' });
              }
            });
          }

          req.session.user = {
            userName: req.user.name,
            userPosition: req.user.position,
            role: req.user.role
          };
          res.redirect("/");
        });

      }
    });

  },

  logoutUser: async (req, res) => {

    req.logout((err) => {
      if (err) { return next(err); }
      res.redirect('/');
    });

  },
  registerUser: async (req, res) => {
    res.render('register');
  },
  register: async (req, res) => {

    const name = req.body.name
    const role = req.body.role
    const email = req.body.email
    const username = req.body.username
    const position = req.body.position
    const password = req.body.password

    User.register(new User({ name: name, role: role, email: email, username: username, position: position }), password,  (err, user) =>{
      if (err) {
        res.json({ success: false, message: "Your account could not be saved. Error: " + err });
      }
      else {
        console.log('new user has been saved.');
        res.redirect("/");
      }
    });

  },

  changePass: async (req, res) => {

    const password = '@himauzumaki'
    const username = 'chocho'

    User.findByUsername(username).then(function(sanitizedUser) {
      if (sanitizedUser) {
          sanitizedUser.setPassword(password, function() {
              sanitizedUser.save();
              console.log('password reset successful');
              res.redirect("/logout");
          });
      } else {
          res.send('user does not exist');
      }
  }, function(err) {
      console.error(err);
  })

   

  },


}