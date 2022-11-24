require('dotenv').config();
const express = require('express');
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const connectDB = require('./config/dbConn')
const PORT = process.env.PORT || 3000

const session = require('express-session');
const MemoryStore = require('memorystore')(session)
const passport =require("passport");

const path = require('path')
const app = express();
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
    cookie: { maxAge: 86400000 },
    store: new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
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
app.use('/', express.static(path.join(__dirname, 'public')))

connectDB()

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
