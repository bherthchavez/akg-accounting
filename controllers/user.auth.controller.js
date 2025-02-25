const User = require('../models/User');
const LoginHistory = require('../models/LoginHistory');
const passport = require('passport');
const ip = require('ip');

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const LocalStrategy = require('passport-local').Strategy;
passport.use(new LocalStrategy(User.authenticate()));

module.exports = {
  signIn: async (req, res) => {
    res.render('sign-in', { title: 'Sign In User', alert: 0 });
  },

  checkUser: async (req, res, next) => {
    try {
      const user = new User({ username: req.body.username, password: req.body.password });
      
      await req.login(user, async (err) => {
        if (err) {
          return res.json({ message: err.message, type: 'danger' });
        }

        req.session.message = {
          message: 'Incorrect login credential',
          type: 'warning'
        };

        passport.authenticate('local', async (err, user, info) => {
          if (err) return next(err);
          if (!user) return res.redirect('/sign-in');

          req.logIn(user, async (err) => {
            if (err) return next(err);
            
            if (user.userRole !== 'Hokage') {
              try {
                await LoginHistory.create({
                  name: user.name,
                  user_name: req.body.username,
                  id_address: ip.address(),
                  id_address2: req.connection.remoteAddress,
                  status: 'Success'
                });
              } catch (logErr) {
                console.error('Error saving login history:', logErr);
              }
            }

            console.log(`User Login! Ip: ${req.connection.remoteAddress} Name: ${user.name}`);
            req.session.user = {
              userName: user.name,
              userPosition: user.position,
              role: user.role,
              company: user.company,
              company_id: user.company_id
            };

            return user.role === 1 ? res.redirect('/owner-dashboard') : res.redirect('/');
          });
        })(req, res, next);
      });
    } catch (error) {
      console.error('Login Error:', error);
      res.status(500).json({ message: 'Internal Server Error', type: 'danger' });
    }
  },

  logoutUser: async (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.redirect('/');
    });
  }
};