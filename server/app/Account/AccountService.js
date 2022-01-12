var util = require('util');
require('dotenv').config();
const jwt = require("jsonwebtoken");
const AccountModel = require("./AccountModel");
const Web3 = require('web3');
const net = require('net');
var fs = require("fs");
const { json } = require('body-parser');
var keythereum = require("keythereum");

const UNLOCK_ACCOUNT_INTERVAL = process.env.UNLOCK_ACCOUNT_INTERVAL || 15000; // 15s
const ETHER_NETWORK = process.env.ETHER_NETWORK || "goerli";

// For Linux
var GETH_DATA_DIR = process.env.HOME + "/.ethereum/" + ETHER_NETWORK
var ipcPath = GETH_DATA_DIR + "/geth.ipc";
if (process.platform.search('win32') >= 0) {
    // For Windows
    GETH_DATA_DIR = process.env.LOCALAPPDATA +"\\Ethereum\\" + ETHER_NETWORK;
    ipcPath = "\\\\.\\pipe\\geth.ipc";
}

var gethIpcTimer = null;
var web3 = null;
var myEthAddress = null;
var accountModel = new AccountModel();

function attachToGethIPC() {
    fs.access(ipcPath, (err) => {
        if (!err) {
            console.log("Attached to Geth IPC successfully");
            web3 = new Web3(new Web3.providers.IpcProvider(ipcPath, net));
            if (!web3) {
                return;
            }
            clearTimeout(gethIpcTimer);
            gethIpcTimer = null;
        }
    });
}

gethIpcTimer = setTimeout(attachToGethIPC, 10000);

var self = null;

/**
 * Controller for user authentication
 */
class AccountService {
    constructor() {
        self = this;
        this.gethError = null
        this.chainName = (ETHER_NETWORK === '.'? 'main': ETHER_NETWORK).trim();
        console.log("********* Current chain name: '", this.chainName, "'");
    }

    create(newAccountInfo, response) {
        if (web3 == null) {
            console.log("AccountService.createAccount(): Geth node is not ready yet. Please retry a while later.");
            return resp.json({ error: -10, data: "Geth node is not ready yet. Please retry a while later."})
        }
        
        web3.eth.personal.newAccount(newAccountInfo.accountPassword).then(function(myEthAddress) {
            if (myEthAddress.length !== 42) {
                return response.json({ error: -11, data: "Created account address invalid"});
            }
            // Get private key for new account
            var keyObject = keythereum.importFromFile(myEthAddress, GETH_DATA_DIR);
            // var privateKey = keythereum.recover(params.password, keyObject);
            var privateKey = keythereum.recover(newAccountInfo.accountPassword, keyObject);
            var secretKey = privateKey.toString('hex');
            var secretKeys = newAccountInfo.secretKeys;
            secretKeys.eth = secretKey;
            accountModel.updateSecretKeys(newAccountInfo.id, secretKeys).then(accountInfo => {
                let addresses = accountInfo.addresses;
                addresses.eth = myEthAddress;
                accountModel.updateAddresses(accountInfo.id, addresses).then(accountInfo => {
                    return response.json({
                        error: 0,
                        data: accountInfo.addresses
                    });
                }).catch(error => {
                    let errorMessage = error.message.replace("Returned error: ", "");
                    return resp.json({error: -200, data: "Error 10000: " + errorMessage});
                });
            }).catch(error => {
                let errorMessage = error.message.replace("Returned error: ", "");
                return resp.json({error: -201, data: "Error 10001: " + errorMessage});
            });
        }).catch(error => {
            let errorMessage = error.message.replace("Returned error: ", "");
            return resp.json({error: -202, data: "Error 10002: " + errorMessage});
        });
    }

    /**
     * @param {object} req request object from the client 
     * @param {object} resp response object to the client
     */
    balance = (accountInfo, token, resp) => {
        if (web3 == null) {
            return resp.json({ error: -10, data: "Geth node is not ready yet. Please retry a while later."})
        }
        let myEthAddress = accountInfo.addresses[token];
        web3.eth.getBalance(myEthAddress).then(function(balanceInWei) {
            let balance = web3.utils.fromWei(balanceInWei, 'ether');
            resp.json({ error: 0, data: balance });
        }).catch(error => {
            let errorMessage = error.message.replace("Returned error: ", "");
            return resp.json({error: -200, data: "Error 10010: " + errorMessage});
        });
    }

    /**
     * @param {object} req request object from the client
     * @param {object} resp response object to the client
     */
    lock = (userToken, resp) => {
        accountModel.findOne({
            where: {
                user_token: userToken
            }
        }).then(accountInfo => {
            accountModel.setLock(accountInfo.id, true).then(ret => {
                if (ret) {
                    return resp.json({ error: 0 });
                } else {
                    return resp.json({ error: -10, data: "Failed to lock account" })
                }
            }).catch(error => {
                let errorMessage = error.message.replace("Returned error: ", "");
                return resp.json({error: -200, data: "Error 10020: " + errorMessage});
            });
        }).catch(error => {
            let errorMessage = error.message.replace("Returned error: ", "");
            return resp.json({error: -200, data: "Error 10021: " + errorMessage});
        });
    }

    /**
     * @param {object} req request object from the client 
     * @param {object} resp response object to the client
     */
    unlock = (userToken, resp) => {
        accountModel.findOne({
            where: {
                user_token: userToken
            }
        }).then(accountInfo => {
            accountModel.setLock(accountInfo.id, false).then(ret => {
                if (ret) {
                    return resp.json({ error: 0 });
                } else {
                    return resp.json({ error: -10, data: "Failed to unlock account" })
                }
            }).catch(error => {
                let errorMessage = error.message.replace("Returned error: ", "");
                return resp.json({error: -200, data: "Error 10030: " + errorMessage});
            });
        }).catch(error => {
            let errorMessage = error.message.replace("Returned error: ", "");
            return resp.json({error: -201, data: "Error 10031: " + errorMessage});
        });
    }

    /**
     * @param {object} req request object from the client
     * @param {object} resp response object to the client
     */
    sendToken = (accountInfo, token, toAddress, toAmount, resp) => {
        if (web3 == null) {
            return resp.json({ error: -10, data: "sendToken(): Geth node is not ready yet. Please retry a while later."})
        }
        if (accountInfo == undefined || accountInfo.addresses == undefined || accountInfo.addresses == {}) {
            return resp.json({ error: -11, data: "sendToken(): No account for you"});
        }
        var addresses = accountInfo.addresses;
        myEthAddress = addresses[token];
        var amountToSend = web3.utils.toWei(toAmount.toString(), "ether");
        web3.eth.personal.unlockAccount(myEthAddress, accountInfo.account_password, UNLOCK_ACCOUNT_INTERVAL)
        .then(function(ret) {
            if (!ret) {
                return resp.json({ error: -12, data: "Failed to unlock for sending" });
            }
            web3.eth.sendTransaction({
                "from": myEthAddress,
                "to": toAddress,
                "value": amountToSend
            }).then(function(txHash) {
                return resp.json({error: 0, data: txHash});
            }).catch(error => {
                let errorMessage = error.message.replace("Returned error: ", "");
                return resp.json({error: -200, data: "Error 10040: " + errorMessage});
            });
        }).catch(error => {
            let errorMessage = error.message.replace("Returned error: ", "");
            return resp.json({error: -201, data: "Error 10041: " + errorMessage});
        });
    }
};

module.exports = AccountService;