const express = require("express");
let account = express.Router();

const AccountController = require("../controller/AccountController");
var accountController = new AccountController();

account.post("/create", accountController.create);
account.post("/", accountController.getMyAccount);
account.post("/balance", accountController.balance);
account.post("/connect", accountController.connectToAccount);
account.post("/send", accountController.send);

module.exports = account;
