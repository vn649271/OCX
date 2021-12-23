const express = require("express");
let wallet = express.Router();

const WalletController = require("../controller/WalletController");
var walletController = new WalletController();

wallet.post("/create", walletController.create);
wallet.get("/balance/:userToken", walletController.balance);
wallet.post("/connect", walletController.connectToWallet);
wallet.post("/send", walletController.send);

module.exports = wallet;
