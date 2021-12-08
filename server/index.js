var express = require("express");
var cors = require("cors");
var bodyParser = require("body-parser");
var app = express();
var session = require('express-session');
var flash = require('express-flash');
const cookieSession = require('cookie-session');
require('dotenv').config();
var randtoken = require('rand-token');

var port = process.env.PORT;


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

app.listen(port, () => {
  console.log("server running at ", port);
});
