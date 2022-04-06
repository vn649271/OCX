const express = require("express");
let account = express.Router();

const AccountController = require("../Account/AccountController");
var accountController = new AccountController();

account.post("/create", accountController.create);
account.post("/restore", accountController.restore);
account.post("/balances", accountController.balances);
account.post("/connect", accountController.connect);
account.post("/send", accountController.send);
account.post("/lock", accountController.lock);
account.post("/unlock", accountController.unlock);
account.post("/swap", accountController.swap);
account.post("/tokenList", accountController.tokenList);
account.post("/tokenPriceRate", accountController.tokenPriceRate);
account.post("/getBestPrice", accountController.getBestPrice);
account.post("/prices", accountController.getPrices);

module.exports = account;
