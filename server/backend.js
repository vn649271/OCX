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
 * Router for wallet management
 */
var Wallet = require("./app/routes/Wallet");
app.use("/api/wallet", Wallet);

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

app.listen(port, () => {
  console.info("server running at ", port);

  const { spawn } = require('child_process');
  const geth = spawn('geth', ['--goerli', '--syncmode', 'light', 'console']);

  geth.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
      setTimeout(
        function() {
          console.log("****************** 0x1258de75769e84282daf2eca320f84a9d235f526 ****************");
          geth.stdin.write('eth.getBalance("0x1258de75769e84282daf2eca320f84a9d235f526\n")');
        },
        5000
      );
  });

  geth.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
  });

  geth.on('close', (code) => {
      console.log(`child process exited with code ${code}`);
  });
});


