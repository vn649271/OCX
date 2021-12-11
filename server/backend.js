var express = require("express");
var cors = require("cors");
var bodyParser = require("body-parser");
var app = express();
require('dotenv').config();

var port = process.env.BACKEND_PORT;

app.use(bodyParser.json());
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

/**
 * Router for user login and register
 */
var Users = require("./app/routes/Users");
app.use("/api/users", Users);

/**
 * Router for recaptcha
 */
var recaptchaRouter = require('./app/routes/Recaptcha');
app.use('/api/recaptcha', recaptchaRouter);

/**
 * If the this server is running in local host, remove the environment GOOGLE_APPLICATION_CREDENTIALS
 */
if (process.argv.length < 3 || process.argv[2] != 'dev') {
  process.env.RUN_MODE = 1; // It is from "npm start"
}

// if (process.env.RUN_MODE == 1) { // run in dedicated server, but not in local one
//   process.env.GOOGLE_APPLICATION_CREDENTIALS = null;
// }

app.listen(port, () => {
  console.info("server running at ", port);
});
