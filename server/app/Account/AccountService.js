var util = require('util');
require('dotenv').config();
const jwt = require("jsonwebtoken");
const AccountModel = require("./AccountModel");
const Web3 = require('web3');
const net = require('net');
var fs = require("fs");
const { spawn } = require('child_process');
const { json } = require('body-parser');
var keythereum = require("keythereum");

const UNLOCK_ACCOUNT_INTERVAL = process.env.UNLOCK_ACCOUNT_INTERVAL || 15000; // 15s
const ETHER_NETWORK = process.env.ETHER_NETWORK || "goerli";
// For Linux
// const GETH_DATA_DIR = process.env.HOME + "/.ethereum/" + ETHER_NETWORK
// const ipcPath = GETH_DATA_DIR + "/geth.ipc"; // For Linux
// For Windows
// EX: C:\Users\PolarStar\AppData\Local\Ethereum\goerli\keystore
const GETH_DATA_DIR = process.env.LOCALAPPDATA +"\\Ethereum\\" + ETHER_NETWORK;
const ipcPath = "\\\\.\\pipe\\geth.ipc";

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

    createAccount(params) {
        web3.eth.personal.newAccount(params.password).then(function(accountAddress) {
            if (accountAddress.length !== 42) {
                console.log("Invalid account address");
                return params.response.json({ error: -4, data: "Created account address invalid"});
            }
            // Get private key for new account
            var keyObject = keythereum.importFromFile(accountAddress, GETH_DATA_DIR);
            var privateKey = keythereum.recover(params.password, keyObject);

            accountModel.create({
                user_token: params.userToken,
                passphrase: params.passphrase,
                password: params.password,
                accounts: {
                    eth: {
                        address: accountAddress,
                        private: privateKey.toString('hex')
                    }
                },
                locked: false // unlocked
            }).then(accountInfo => {
                return params.response.json({ 
                    error: 0,
                    data: accountAddress
                });                
            }).catch(err => {
                return resp.json({ error: -5, data: err });
            });
        }).catch(err => {
            return resp.json({ error: -6, data: err });
        });
    }

    /**
     * @param {object} req request object from the client 
     * @param {object} resp response object to the client
     */
    balance = (accounts, token, resp) => {
        if (web3 == null) {
            return resp.json({ error: -1, data: "Geth node is not ready yet. Please retry a while later."})
        }
        let myAccount = accounts[token].address;
        web3.eth.getBalance(myAccount).then(function(balanceInWei) {
            console.log(balanceInWei);
            let balance = web3.utils.fromWei(balanceInWei, 'ether');
            resp.json({ error: 0, data: balance });
        }).catch(error => {
            return resp.json({error: -5, data: error});
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
                    return resp.json({ error: -1, data: "Failed to lock account" })
                }
            });
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
                    return resp.json({ error: -1, data: "Failed to unlock account" })
                }
            });
        });
    }

    /**
     * @param {object} req request object from the client
     * @param {object} resp response object to the client
     */
     sendToken = (accountInfo, token, toAddress, toAmount, resp) => {
        if (web3 == null) {
            return resp.json({ error: -3, data: "Geth node is not ready yet. Please retry a while later."})
        }
        if (accountInfo == undefined || accountInfo.accounts == undefined || accountInfo.accounts == {}) {
            console.log("No account");
            return resp.json({ error: -5, data: "No account for you"});
        }
        var accounts = accountInfo.accounts;
        myAccount = accounts[token].address;
        var amountToSend = web3.utils.toWei(toAmount.toString(), "ether");
        web3.eth.personal.unlockAccount(myAccount, accountInfo.password, UNLOCK_ACCOUNT_INTERVAL)
        .then(function(ret) {
            if (!ret) {
                return resp.json({ error: -6, data: "Failed to unlock for sending" });
            }
            web3.eth.sendTransaction({
                "from": myAccount,
                "to": toAddress,
                "value": amountToSend
            }).then(function(txHash) {
                return resp.json({error: 0, data: txHash});
            }).catch(error => {
                return resp.json({error: -10, data: error.message});
            });
        }).catch(error => {
            return resp.json({error: -7, data: error});
        });
    }
};

module.exports = AccountService;