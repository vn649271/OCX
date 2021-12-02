var express = require("express");
var cors = require("cors");
var bodyParser = require("body-parser");
var app = express();
var session = require('express-session');
var flash = require('express-flash');
const cookieSession = require('cookie-session');
const passport = require('passport');
require('./utils/passportPreset');
require('dotenv').config();
var randtoken = require('rand-token');

var port = process.env.PORT;

/**
 * Configure Gmail Authentication
 */
var key1 = randtoken.generate(20);
var key2 = randtoken.generate(20);
app.use(cookieSession({
    name: 'google-auth-session',
    keys: ['key1', 'key2']
}))

app.use(session({ 
    secret: '123458cat',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}))
app.use(flash());

app.use(bodyParser.json());
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

/**
 * Router for user login and register
 */
var Users = require("./routes/Users");
app.use("/users", Users);

/**
 * Router for recaptcha
 */
var recaptchaRouter = require('./routes/Recaptcha');
app.use('/recaptcha', recaptchaRouter);

/**
 * Router for Gmail-Authentication
 */
 var gmailAuthRouter = require('./routes/GmailAuth');
app.use('/google', gmailAuthRouter);

app.listen(port, () => {
  console.log("server running");
});
