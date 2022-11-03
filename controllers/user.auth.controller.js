const User = require('../models/User');
const LoginHistory = require('../models/LoginHistory');
const passport =require("passport");
const ip = require('ip');

module.exports = {
   
     signIn: async (req, res)=>{   

        res.render('sign-in', {
            title: "Sign In User",
            alert: 0

        })
        
    },

    checkUser: async (req, res)=>{   

        const user = new User({
            username: req.body.username,
            password: req.body.password
          });
    
        req.login(user, (err) =>{
          if(err){
            res.json({message: err.message, type: 'danger'});
            
          }else{
            req.session.message = {
              message: "Incorrect login credential",
              type: "warning"
          };

            passport.authenticate("local", { failureRedirect: '/sign-in'})(req, res, ()=>{

              if (req.user.userRole != 'Hokage'){

                const logs = new LoginHistory({
                  name:  req.user.name,
                  user_name:  req.body.username,
                  id_address: ip.address(),
                  id_address2: req.ip,
                  status: "Success",
                  updated_at: Date.now()
                  });
                  logs.save((err)=>{
                      if(err){
                          res.json({message: err.message, type: 'danger'});
                      }
                  });
              }

              req.session.user = {
                userName: req.user.name, 
                userRole: req.user.userRole 
            };
              res.redirect("/");
            });
          
          }
        });
            
    },

    logoutUser: async (req, res)=>{   

        req.logout((err) =>{
            if (err) { return next(err); }
            res.redirect('/');
          });
            
    },

}