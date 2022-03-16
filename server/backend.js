var express = require("express");
const fileupload = require("express-fileupload");
var cors = require("cors");
var bodyParser = require("body-parser");
var app = express();
const { spawn } = require('child_process');
require('dotenv').config();

var port = process.env.BACKEND_PORT;

app.use(cors());
app.use(fileupload());
app.use(express.static("files"));
app.use(bodyParser.json());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

/**
 * Router for user login and register
 */
var Users = require("./app/routes/Users");
app.use("/api/users", Users);

/**
 * Router for account management
 */
var Account = require("./app/routes/Account");
app.use("/api/account", Account);

/**
 * Router for pawnshop management
 */
 var Pawnshop = require("./app/routes/Pawnshop");
 app.use("/api/pawnshop", Pawnshop);
 
 /**
 * Router for recaptcha
 */
var recaptchaRouter = require('./app/routes/Recaptcha');
app.use('/api/recaptcha', recaptchaRouter);

var liveUpdateRouter = require('./app/routes/LiveUpdate');
app.use('/api/update', liveUpdateRouter);

/**
 * If the this server is running in local host, remove the environment GOOGLE_APPLICATION_CREDENTIALS
 */
if (process.argv.length < 3 || process.argv[2] != 'dev') {
  process.env.RUN_MODE = 1; // It is from "npm start"
}

app.listen(port, () => {
    console.info("server running at ", port);
    if (process.env.BLOCKCHAIN_EMULATOR == undefined ||
    process.env.BLOCKCHAIN_EMULATOR === null) {
        var geth = spawn('geth', ['--goerli', '--syncmode', 'light']);
        geth.stdout.on('data', (data) => {
            console.log(`geth:stdout: ${data}`);
        });
        geth.stderr.on('data', (data) => {
            console.log(`geth:stderr: ${data}`);
        });
        geth.on('close', (code) => {
            console.log(`geth: child process exited with code ${code}`);
        });
    }
});


