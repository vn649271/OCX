var util = require('util');
require('dotenv').config();
const jwt = require("jsonwebtoken");
const User = require("../models/Firestore/Users");
const Web3 = require('web3');
const net = require('net');
var fs = require("fs");
const { spawn } = require('child_process');
const { json } = require('body-parser');

const MY_ACCOUNT_PASSWORD = process.env.MY_ACCOUNT_PASSWORD || "123qweasdzxcM<>";
const UNLOCK_ACCOUNT_INTERVAL = process.env.UNLOCK_ACCOUNT_INTERVAL || 15000; // 15s
const ETHER_NETWORK = process.env.ETHER_NETWORK || "goerli";
const ipcPath = process.env.HOME + "/.ethereum/" + ETHER_NETWORK + "/geth.ipc";


var geth = spawn('./geth', ['--goerli', '--syncmode', 'light']);
geth.stdout.on('data', (data) => {
    console.log(`geth:stdout: ${data}`);
});
geth.stderr.on('data', (data) => {
    // console.log("ggggggggggggggggggggggggggggg: ", typeof data);
    // if (typeof data === 'object') {
    //     let retStr = new Buffer.from(data).toString();
    //     if (retStr.length > 4 && retStr.substring(0, 5) === 'INFO ') {
    //       return; // If string is INFO message, ignore
    //     }
    //     if (self !== null) {
    //         self.setGethError(retStr);
    //     }
    // }
    console.log(`geth:stderr: ${data}`);
});
geth.on('close', (code) => {
    console.log(`geth: child process exited with code ${code}`);
});

var gethIpcTimer = null;
var web3 = null;
var myAccount = null;
var userModel = new User();

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

    _create(password, resp) {
        let command = "geth account new";
        exec(command, function (error, stdout, stderr) {
            if (stdout.length < 1) {
                return resp.json({ error: -10, data: "Failed to create a new account." });
            }
            const obj = JSON.parse(stdout);
            return resp.json({ error: 0, data: "" });
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
        let ret = userModel.validateUserToken(req.body.userToken);
        if (!ret || ret.error < 0) {
            return resp.json({ error: -2, data: "Invalid user token" });
        }
        if (req.body === null || req.body.password === undefined ||
        req.body.password === null) {
            return resp.json({ error: -3, data: "Invalid password" });
        }

        return this._create(req.body.password, resp);
    }

    /**
     * Get information  for my account including account address
     * @param {object} req 
     * @param {object} resp 
     * @returns 
     */
    getMyAccount = (req, resp) => {
        return resp.json({
            error: 0,
            data: {
                account_address: ""
            }
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
        let ret = userModel.validateUserToken(req.body.userToken);
        if (!ret || ret.error < 0) {
            return resp.json({ error: -2, data: "Invalid user token" });
        }

        return resp.json({ error: 0, data: "" });
    }

    /**
     * @param {object} req request object from the client 
     * @param {object} resp response object to the client
     */
    balance = (req, resp, next) => {
        if (web3 == null) {
            return resp.json({ error: -3, data: "Geth node is not ready yet. Please retry a while later."})
        }
        if (req.params === undefined || req.params.userToken === undefined ||
        req.params.userToken === null) {
            return resp.json({ error: -1, data: "Invalid request" });
        }
        let userToken = req.params.userToken;
        let ret = userModel.validateUserToken(userToken);
        if (!ret || ret.error < 0) {
            return resp.json({ error: -2, data: "Invalid user token" });
        }
        web3.eth.personal.getAccounts().then(function(accounts) {
            if (accounts.length < 1) {
                console.log("No account");
                return resp.json({ error: -3, data: "No account for you"});
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
    send = (req, resp) => {
        if (web3 == null) {
            return resp.json({ error: -3, data: "Geth node is not ready yet. Please retry a while later."})
        }
        if (req.body === null || req.body.userToken === undefined ||
        req.body.userToken === null) {
            return resp.json({ error: -1, data: "Invalid request" });
        }
        let ret = userModel.validateUserToken(req.body.userToken);
        if (!ret || ret.error < 0) {
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