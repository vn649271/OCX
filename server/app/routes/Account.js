const express = require("express");
let account = express.Router();

const AccountController = require("../controller/AccountController");
var accountController = new AccountController();

account.post("/create", accountController.create);
account.post("/balance", accountController.balance);
account.post("/connectWallet", accountController.connectToWallet);
account.post("/send", accountController.send);

module.exports = account;
