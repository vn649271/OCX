var util = require('util');
require('dotenv').config();
const jwt = require("jsonwebtoken");
const UserController = require("./UserAuthController");
const Account = require("../models/Firestore/Account");
const Web3 = require('web3');
const net = require('net');
var fs = require("fs");
const { spawn } = require('child_process');
const { json } = require('body-parser');
const { generate, generateMultiple } = require('generate-passphrase-id')
var keythereum = require("keythereum");

const MY_ACCOUNT_PASSWORD = process.env.MY_ACCOUNT_PASSWORD || "123qweasdzxcM<>";
const UNLOCK_ACCOUNT_INTERVAL = process.env.UNLOCK_ACCOUNT_INTERVAL || 15000; // 15s
const ETHER_NETWORK = process.env.ETHER_NETWORK || "goerli";
const GETH_DATA_DIR = process.env.HOME + "/.ethereum/" + ETHER_NETWORK
const ipcPath = GETH_DATA_DIR + "/geth.ipc"; // For Linux
// const ipcPath = "\\\\.\\pipe\\geth.ipc";    // For Windows

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

var gethIpcTimer = null;
var web3 = null;
var myAccount = null;
var userController = new UserController();
var accountModel = new Account();

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
class AccountController {
    constructor() {
        self = this;
        this.gethError = null
        this.chainName = (ETHER_NETWORK === '.'? 'main': ETHER_NETWORK).trim();
        console.log("********* Current chain name: '", this.chainName, "'");
    }

    _create(params) {
        web3.eth.personal.newAccount(params.password).then(function(accountAddress) {
            if (accountAddress.length !== 42) {
                console.log("Invalid account address");
                return params.response.json({ error: -4, data: "Created account address invalid"});
            }
            // Get private key for new account
            var keyObject = keythereum.importFromFile(accountAddress, GETH_DATA_DIR);
            var privateKey = keythereum.recover(params.password, keyObject);
            console.log("Private Key for new account: ", privateKey.toString('hex'));

            accountModel.create({
                user_token: params.userToken,
                passphrase: params.passphrase,
                password: params.password,
                accounts: {
                    eth: {
                        address: accountAddress,
                        private: privateKey
                    }
                }
            }).then(accountInfo => {
                console.log("*********** Created Account: ", accountInfo);
                return params.response.json({ 
                    error: 0,
                    data: accountInfo.id,
                    address: accountAddress
                });                
            })

        });
    }

    setGethError(errStr) {
        this.gethError = errStr;
    }

    /**
     * Create an account in blockchain for user
     * @param {object} req request object from the client 
     * @param {object} resp response object to the client
     */
    create = (req, resp) => {
        if (req.body === null || req.body.userToken === undefined ||
            req.body.userToken === null) {
            return resp.json({ error: -1, data: "Invalid request" });
        }
        let ret = userController.validateUserToken(req.body.userToken);
        if (!ret < 0) {
            return resp.json({ error: -2, data: "Invalid user token" });
        }
        if (req.body === null || req.body.password === undefined ||
        req.body.password === null) {
            return resp.json({ error: -3, data: "Invalid password" });
        }

        const passphrase = generate({ length: 12, separator: ' ', titlecase: true });
        console.log(passphrase);

        this._create({
            userToken: req.body.userToken,
            password: req.body.password, 
            passphrase: passphrase,
            response: resp
        });
    }

    /**
     * Get information  for my account including account address
     * @param {object} req 
     * @param {object} resp 
     * @returns 
     */
    getMyAccount = (req, resp) => {
        if (web3 == null) {
            return resp.json({ error: -3, data: "Geth node is not ready yet. Please retry a while later."})
        }
        var userToken = req.body? req.body.userToken? req.body.userToken: null: null;
        if (userToken === null) {
            return resp.json({ error: -1, data: "Invalid request" });
        }
        let ret = userController.validateUserToken(userToken);
        if (!ret < 0) {
            return resp.json({ error: -2, data: "Invalid user token" });
        }
        accountModel.findOne({
            where: {
                user_token: userToken
            }
        }).then(ret => {
            if (ret === undefined || ret === null) {
                return resp.json({ error: 1, data: "No account" });
            }
            return resp.json({  error: 0, data: ret });
        }).catch(err => {
            return resp.json({ error: -3, data: err + " --> " + req.body.password + " ++error" });
        });
    }

    /**
     * Connect to the specified account
     * @param {object} req request object from the client 
     * @param {object} resp response object to the client
     */
    connectToAccount = (req, resp) => {
        if (req.body === null || req.body.userToken === undefined ||
            req.body.userToken === null) {
            return resp.json({ error: -1, data: "Invalid request" });
        }
        let ret = userController.validateUserToken(req.body.userToken);
        if (!ret < 0) {
            return resp.json({ error: -2, data: "Invalid user token" });
        }

        return resp.json({ error: 0, data: "" });
    }

    /**
     * @param {object} req request object from the client 
     * @param {object} resp response object to the client
     */
    balance = (req, resp) => {
        if (web3 == null) {
            return resp.json({ error: -1, data: "Geth node is not ready yet. Please retry a while later."})
        }
        var userToken = req.body ? req.body.userToken? req.body.userToken: null: null;
        if (userToken === null) {
            return resp.json({ error: -2, data: "Invalid request" });
        }
        let ret = userController.validateUserToken(userToken);
        if (!ret < 0) {
            return resp.json({ error: -3, data: "Invalid user token" });
        }
        accountModel.getMyAccount(userToken);
        web3.eth.personal.getAccounts().then(function(accounts) {
            if (accounts.length < 1) {
                console.log("No account");
                return resp.json({ error: -4, data: "No account for you"});
            }
            myAccount = accounts[0];
            web3.eth.getBalance(myAccount).then(function(balanceInWei) {
                console.log(balanceInWei);
                let balance = web3.utils.fromWei(balanceInWei, 'ether');
                resp.json({ error: 0, data: balance });
            });
        });
    }

    /**
     * @param {object} req request object from the client 
     * @param {object} resp response object to the client
     */
    lock = (req, resp) => {
        if (web3 == null) {
            return resp.json({ error: -1, data: "Geth node is not ready yet. Please retry a while later."})
        }
        var userToken = req.body ? req.body.userToken? req.body.userToken: null: null;
        if (userToken === null) {
            return resp.json({ error: -2, data: "Invalid request" });
        }
        let ret = userController.validateUserToken(userToken);
        if (!ret < 0) {
            return resp.json({ error: -3, data: "Invalid user token" });
        }
        accountModel.getAddresses(userToken).then(accounts => {
            if (accounts == undefined || accounts == {}) {
                console.log("No account");
                return resp.json({ error: -4, data: "No account for you"});
            }
            myAccount = accounts.eth.address;
            web3.eth.personal.lockAccount(myAccount).then(ret => {
                return resp.json({ error: 0, data: ret });
            });
        });
    }

    /**
     * @param {object} req request object from the client 
     * @param {object} resp response object to the client
     */
    unlock = (req, resp) => {
        if (web3 == null) {
            return resp.json({ error: -1, data: "Geth node is not ready yet. Please retry a while later."})
        }
        var userToken = req.body ? req.body.userToken? req.body.userToken: null: null;
        if (userToken === null) {
            return resp.json({ error: -2, data: "Invalid request" });
        }
        let ret = userController.validateUserToken(userToken);
        if (!ret < 0) {
            return resp.json({ error: -3, data: "Invalid user token" });
        }
        var password = req.body ? req.body.password ? req.body.password : null : null;

        accountModel.getAddresses(userToken).then(accounts => {
            if (accounts == undefined || accounts == {}) {
                console.log("No account");
                return resp.json({ error: -4, data: "No account for you"});
            }
            myAccount = accounts.eth.address;
            web3.eth.personal.unlockAccount(myAccount, password).then(ret => {
                return resp.json({ error: 0, data: ret });
            });
        });
    }

    /**
     * @param {object} req request object from the client
     * @param {object} resp response object to the client
     */
    send = (req, resp) => {
        if (web3 == null) {
            return resp.json({ error: -3, data: "Geth node is not ready yet. Please retry a while later."})
        }
        if (req.body === null || req.body.userToken === undefined ||
        req.body.userToken === null) {
            return resp.json({ error: -1, data: "Invalid request" });
        }
        let ret = userController.validateUserToken(req.body.userToken);
        if (!ret < 0) {
            return resp.json({ error: -2, data: "Invalid user token" });
        }
        if (req.body === null || req.body.toAddress === undefined ||
        req.body.toAddress === null) {
            return resp.json({ error: -3, data: "Invalid destination address" });
        }
        if (req.body === null || req.body.amount === undefined ||
        req.body.amount === null) {
            return resp.json({ error: -4, data: "Invalid sending amount" });
        }

        var toAddress = req.body.toAddress;
        var toAmount = req.body.amount;

        web3.eth.personal.getAccounts().then(function(accounts) {
            if (accounts.length < 1) {
                console.log("No account");
                return;
            }
            console.log("Accounts: ", accounts);
            myAccount = accounts[0];
            console.log("My Account: ", myAccount);
            web3.eth.personal.unlockAccount(myAccount, MY_ACCOUNT_PASSWORD, UNLOCK_ACCOUNT_INTERVAL)
            .then(function(ret) {
                console.log("Unlocking: ", ret);
                if (!ret) {
                    console.log("Failed to unlock the account");
                    return;
                }
                let amountToSend = web3.utils.toWei(toAmount.toString(), "ether");
                web3.eth.sendTransaction({
                    "from": myAccount,
                    "to": toAddress,
                    "value": amountToSend
                }).then(function(txHash) {
                    return resp.json({error: 0, data: txHash});
                });
            });
        });
    }
};

module.exports = AccountController;