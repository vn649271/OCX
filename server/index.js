var express = require("express");
var cors = require("cors");
var bodyParser = require("body-parser");
var app = express();
require('dotenv').config();

var port = process.env.PORT;

app.use(bodyParser.json());
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

var Users = require("./routes/Users");
app.use("/users", Users);
var recaptchaRouter = require('./routes/recaptcha');
app.use('/recaptcha', recaptchaRouter);

app.listen(port, () => {
  console.log("server running");
});
