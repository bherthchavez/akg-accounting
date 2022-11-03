require('dotenv').config();
const express = require('express');
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const connectDB = require('./config/dbConn')
const PORT = process.env.PORT || 3000

const sesion = require('express-session');
const passport =require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const path = require('path')
const app = express();
app.set('view engine', 'ejs');


app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(bodyParser.urlencoded({extended: true}));

app.use(sesion({
    secret: process.env.SECRET_SESS,
    saveUninitialized: true,
    resave: false
}));  
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next)=>{
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
});

app.use((req, res, next)=>{
    res.locals.user = req.session.user;
    next();
});

app.use((req, res, next)=>{
    res.locals.settingsAlert = req.session.settingsAlert;
    delete req.session.settingsAlert;
    next();
});

app.use(express.static(path.join(__dirname, 'public')));

connectDB()

const userSchema = new mongoose.Schema ({
    name: String,
    userRole: String,
    email: String,
    created_at: Date,
    username: String,
    password: String
  });
  
  userSchema.plugin(passportLocalMongoose);
  
  const user = new mongoose.model("user", userSchema);
  
  
  passport.use(user.createStrategy());
  passport.serializeUser(user.serializeUser());
  passport.deserializeUser(user.deserializeUser());

    // let name = "himawari";
    // let userRole = "Hokage";
    // let userEmail="b@g.com";
    // let username= "hima";
    // let password="@himauzumaki";
    // user.register({name: name, userRole: userRole, email: userEmail, username: username},password, (err, user)=>{
    // if(err){
    //     console.log(err);
    // }else{
    //     console.log("success.");
    // }
    // });

app.use('', require('./routes/routes'));

app.get('/', (req, res)=>{
    res.json({message: "test on"});
})


mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB')
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
})

mongoose.connection.on('error', err => {
    console.log(err)
})
