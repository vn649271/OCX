var util = require('util');
require('dotenv').config();
const jwt = require("jsonwebtoken");
const AccountModel = require("./AccountModel");
const Web3 = require('web3');
const net = require('net');
var fs = require("fs");
const { json } = require('body-parser');
var keythereum = require("keythereum");
const {
    ETH2Token, 
    Token2ETH,
    DEFAULT_DEADLINE
} = require('../Services/Uniswap/Swap/SwapImpl'); // Services/Uniswap/Swap

const UNLOCK_ACCOUNT_INTERVAL = process.env.UNLOCK_ACCOUNT_INTERVAL || 15000; // 15s
const CHAIN_NAME = process.env.CHAIN_NAME || "goerli";
const CHAIN_ID = process.env.CHAIN_ID || 5;

const MSG__GETH_NOT_READY = "Geth node is not ready yet. Please retry a while later.";

// For Linux
var GETH_DATA_DIR = process.env.HOME + "/.ethereum/" + CHAIN_NAME
var ipcPath = GETH_DATA_DIR + "/geth.ipc";
if (process.platform.search('win32') >= 0) {
    // For Windows
    GETH_DATA_DIR = process.env.LOCALAPPDATA +"\\Ethereum\\" + CHAIN_NAME;
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
        this.chainName = (CHAIN_NAME === '.'? 'main': CHAIN_NAME).trim();
        console.log("********* Current chain name: '", this.chainName, "'");
    }

    getPrivateKey() {
        // Get private key for new account
        var keyObject = keythereum.importFromFile(myEthAddress, GETH_DATA_DIR);
        // var privateKey = keythereum.recover(params.password, keyObject);
        return keythereum.recover(newAccountInfo.accountPassword, keyObject);
    }

    async create(newAccountInfoObj, response) {
        if (web3 == null) {
            console.log("AccountService.createAccount(): Geth node is not ready yet. Please retry a while later.");
            return resp.json({ error: -10, data: MSG__GETH_NOT_READY})
        }
        var accountId = newAccountInfoObj.id;
        var newAccountInfo = await newAccountInfoObj.get();
        newAccountInfo = await newAccountInfo.data();
        var accountPassword = newAccountInfo.account_password;
        var addresses = newAccountInfo.addresses;

        var myEthAddress = await web3.eth.personal.newAccount(accountPassword);
        if (myEthAddress && myEthAddress.length !== 42) {
            return response.json({ error: -11, data: "Created account address invalid"});
        }
        addresses['ETH'] = myEthAddress;
        accountModel.updateAddresses(accountId, addresses).then(ret => {
            return response.json({
                error: 0,
                data: {
                    addresses: newAccountInfo.addresses,
                    locked: newAccountInfo.locked
                }
            });
        }).catch(error => {
            let errorMessage = error.message.replace("Returned error: ", "");
            return response.json({error: -200, data: "Error 10000: " + errorMessage});
        });
    }

    /**
     * @param {object} req request object from the client 
     * @param {object} resp response object to the client
     */
    balance = (addresses, token, resp) => {
        if (web3 == null) {
            return resp.json({ error: -10, data: MSG__GETH_NOT_READY})
        }
        let myEthAddress = addresses[token];
        web3.eth.getBalance(myEthAddress).then(function(balanceInWei) {
            let balance = web3.utils.fromWei(balanceInWei, 'ether');
            resp.json({ error: 0, data: balance });
        }).catch(error => {
            let errorMessage = error.message.replace("Returned error: ", "");
            return resp.json({error: -200, data: "Error 10010: " + errorMessage});
        });
    }

    /**
     * @param {object} userInfo request object from the client
     * @param {object} resp response object to the client
     */
    lock = (userInfo, resp) => {
        let userToken = userInfo.token;
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

    /**
     * @param {object} params request object from the client
     *      {
     *          buySymbol:          token symbol to buy
     *          sellAmount:         ETH amount to sell
     *          acceptableMinRate:  acceptable minimum token value in Wei
     *          deadline:           
     *      }
     * @param {object} resp response object to the client
     */
    swapEthToERC20 = (userInfo, params, resp) => {
        if (web3 == null) {
            return resp.json({ error: -10, data: MSG__GETH_NOT_READY})
        }
        var deadline = params ? 
            params.deadline ? 
                params.deadline : 
                DEFAULT_DEADLINE : 
            DEFAULT_DEADLINE;
        let now = new Date();
        deadline = new Date(now.valueOf() + deadline * 1000);
        var userToken = userInfo.token;
        var amountToSwap = web3.utils.toHex(params.sellAmount * 10 ** 18); // in ETH
        var acceptableMinRate = web3.utils.toHex(
            (params.acceptableMinRate - 0) * 10 ** 18    // 0.2 DAI
        );
        accountModel.findOne({
            where: {
                user_token: userToken
            }
        }).then(accountInfo => {
            ETH2Token(
                web3,
                {
                    address: accountInfo.addresses['ETH'],
                    privateKey: accountInfo.secret_keys['ETH'],
                    buySymbol: params.buySymbol,
                    sellAmount: amountToSwap,
                    acceptableMinRate: acceptableMinRate,
                    deadline: deadline.valueOf() / 1000, // in ms -> in s
                    chainId: CHAIN_ID // Goerli
                },
                (error, result) => {
                    if (!error) {
                        resp.json({ error: 0 });
                    }
                }
            );
        }).catch(error => {
            let errorMessage = error.message.replace("Returned error: ", "");
            return response.json({error: -200, data: "Error 10000: " + errorMessage});
        });
    }

    /**
     * @param {object} req request object from the client
     * @param {object} resp response object to the client
     */
    swapERC20ToEth = (req, resp) => {
        Token2ETH({
            exchangeContractAddress: daiExchangeContract,
            privateKey: privKey,
            addressFrom: addressFrom,
            addressTo: daiExchangeAddress,
            amount: ETH_SOLD
        });        
    }
};


module.exports = AccountService;