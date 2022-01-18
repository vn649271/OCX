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
    SwapEthForToken,
    DEFAULT_DEADLINE
} = require('../Services/Uniswap/Swap/SwapImpl'); // Services/Uniswap/Swap
const { ethers } = require("ethers")
const erc20 = require("@studydefi/money-legos/erc20")
const uniswap = require("@studydefi/money-legos/uniswap")

const UNLOCK_ACCOUNT_INTERVAL = process.env.UNLOCK_ACCOUNT_INTERVAL || 15000; // 15s
const CHAIN_NAME = process.env.CHAIN_NAME || "goerli";
const CHAIN_ID = process.env.CHAIN_ID || 5;

const MSG__GETH_NOT_READY = "Geth node is not ready yet. Please retry a while later.";

// For Linux
var GETH_DATA_DIR = process.env.HOME + "/.ethereum/" + CHAIN_NAME
var ipcPath = GETH_DATA_DIR + "/geth.ipc";
if (process.platform.search('win32') >= 0) {
    // For Windows
    GETH_DATA_DIR = process.env.LOCALAPPDATA + "\\Ethereum\\" + CHAIN_NAME;
    ipcPath = "\\\\.\\pipe\\geth.ipc";
}

var gethIpcTimer = null;
var web3 = null;
var myEthAddress = null;
var accountModel = new AccountModel();
var gethProvider = null;

function attachToGethIPC() {
    fs.access(ipcPath, (err) => {
        if (!err) {
            console.log("Attached to Geth IPC successfully");
            gethProvider = new Web3.providers.IpcProvider(ipcPath, net);
            web3 = new Web3(gethProvider);
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
        this.chainName = (CHAIN_NAME === '.' ? 'main' : CHAIN_NAME).trim();
        console.log("********* Current chain name: '", this.chainName, "'");
    }

    async getPrivateKey(password, ethAddress) {
        // Get private key for new account
        var keyObject = keythereum.importFromFile(ethAddress, GETH_DATA_DIR);
        // var privateKey = keythereum.recover(params.password, keyObject);
        return await keythereum.recover(password, keyObject);
    }

    async create(newAccountInfoObj, response) {
        if (web3 == null) {
            console.log("AccountService.createAccount(): Geth node is not ready yet. Please retry a while later.");
            return resp.json({ error: -10, data: MSG__GETH_NOT_READY })
        }
        try {
            var accountId = newAccountInfoObj.id;
            var newAccountInfo = await newAccountInfoObj.get();
            newAccountInfo = await newAccountInfo.data();
            var accountPassword = newAccountInfo.account_password;
            // Generate public and private keys
            // First, get public key
            var myEthAddress = await web3.eth.personal.newAccount(accountPassword);
            if (myEthAddress && myEthAddress.length !== 42) {
                return response.json({ error: -11, data: "Created account address invalid" });
            }
            // Next, get private key
            var secretKey = await this.getPrivateKey(accountPassword, myEthAddress);
            if (!secretKey) {
                return response.json({ error: -12, data: "Invalid private key" });
            }
            secretKey = secretKey.toString('hex');
            // Final, Save them
            const ret = await accountModel.updateKeyPairs(accountId, 'ETH', myEthAddress, secretKey);
            if (!ret) {
                return response.json({ error: -13, data: "Failed to save key paire" });
            }
            return response.json({
                error: 0,
                data: {
                    addresses: newAccountInfo.addresses,
                    locked: newAccountInfo.locked
                }
            });
        } catch (err) {
            let errorMessage = error.message.replace("Returned error: ", "");
            return resp.json({ error: -200, data: "Error 10010: " + errorMessage });
        }
    }

    /**
     * @param {object} req request object from the client 
     * @param {object} resp response object to the client
     */
    balance = (addresses, token, resp) => {
        if (web3 == null) {
            return resp.json({ error: -10, data: MSG__GETH_NOT_READY })
        }
        let myEthAddress = addresses[token];
        web3.eth.getBalance(myEthAddress).then(function (balanceInWei) {
            let balance = web3.utils.fromWei(balanceInWei, 'ether');
            resp.json({ error: 0, data: balance });
        }).catch(error => {
            let errorMessage = error.message.replace("Returned error: ", "");
            return resp.json({ error: -200, data: "Error 10010: " + errorMessage });
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
                return resp.json({ error: -200, data: "Error 10020: " + errorMessage });
            });
        }).catch(error => {
            let errorMessage = error.message.replace("Returned error: ", "");
            return resp.json({ error: -200, data: "Error 10021: " + errorMessage });
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
                return resp.json({ error: -200, data: "Error 10030: " + errorMessage });
            });
        }).catch(error => {
            let errorMessage = error.message.replace("Returned error: ", "");
            return resp.json({ error: -201, data: "Error 10031: " + errorMessage });
        });
    }

    /**
     * @param {object} req request object from the client
     * @param {object} resp response object to the client
     */
    sendToken = (accountInfo, token, toAddress, toAmount, resp) => {
        if (web3 == null) {
            return resp.json({ error: -10, data: "sendToken(): Geth node is not ready yet. Please retry a while later." })
        }
        if (accountInfo == undefined || accountInfo.addresses == undefined || accountInfo.addresses == {}) {
            return resp.json({ error: -11, data: "sendToken(): No account for you" });
        }
        var addresses = accountInfo.addresses;
        myEthAddress = addresses[token];
        var amountToSend = web3.utils.toWei(toAmount.toString(), "ether");
        web3.eth.personal.unlockAccount(myEthAddress, accountInfo.account_password, UNLOCK_ACCOUNT_INTERVAL)
            .then(function (ret) {
                if (!ret) {
                    return resp.json({ error: -12, data: "Failed to unlock for sending" });
                }
                web3.eth.sendTransaction({
                    "from": myEthAddress,
                    "to": toAddress,
                    "value": amountToSend
                }).then(function (txHash) {
                    return resp.json({ error: 0, data: txHash });
                }).catch(error => {
                    let errorMessage = error.message.replace("Returned error: ", "");
                    return resp.json({ error: -200, data: "Error 10040: " + errorMessage });
                });
            }).catch(error => {
                let errorMessage = error.message.replace("Returned error: ", "");
                return resp.json({ error: -201, data: "Error 10041: " + errorMessage });
            });
    }

    getWallet = async (accountInfo, symbol) => {
        try {
            const provider = new ethers.providers.Web3Provider(gethProvider)
            const wallet = new ethers.Wallet(accountInfo.secret_keys[symbol], provider)
            return wallet;
        } catch (error) {
            let errorMessage = error.message.replace("Returned error: ", "");
            return resp.json({ error: -201, data: "Error 10060: " + errorMessage });
        }
    }
    /**
     * @param {object} req request object from the client
     * @param {object} resp response object to the client
     */
    async swapEthToERC20(params, resp) {
        if (web3 == null) {
            return resp.json({ error: -10, data: "Geth node is not ready yet. Please retry a while later." })
        }
        var accountInfo = params ? params.accountInfo ? params.accountInfo : null : null,
            sellSymbol = params ? params.sellSymbol ? params.sellSymbol : null : null,
            sellAmount = params ? params.sellAmount ? params.sellAmount : 0 : 0,
            buySymbol = params ? params.buySymbol ? params.buySymbol : null : null,
            acceptableMinRate = params ? params.acceptableMinRate ? params.acceptableMinRate : 0 : 0,
            deadline = params ? params.deadline ? params.deadline : DEFAULT_DEADLINE : DEFAULT_DEADLINE;

        if (accountInfo.addresses == undefined || accountInfo.addresses == {}) {
            return resp.json({ error: -11, data: "No account for you" });
        }
        if (sellSymbol === null) {
            return resp.json({ error: -12, data: "Invalid token to sell" });
        }
        if (sellAmount === 0) {
            return resp.json({ error: -13, data: "Invalid amount to sell" });
        }
        if (acceptableMinRate < 0) {
            return resp.json({ error: -14, data: "Invalid slippage" });
        }
        if (buySymbol === null) {
            return resp.json({ error: -15, data: "Invalid token to buy" });
        }

        var addresses = accountInfo.addresses;
        if (addresses[sellSymbol] === undefined || addresses[sellSymbol] === null) {
            return resp.json({ error: -16, data: "Invalid your address for swapping" });
        }
        var myAddress = addresses[sellSymbol];
        sellAmount = web3.utils.toWei(sellAmount.toString(), "ether");
        let now = new Date();
        deadline = new Date(now.valueOf() / 1000 + deadline);
        acceptableMinRate = web3.utils.toHex((acceptableMinRate - 0) * 10 ** 18);

        try {
            let ret = await web3.eth.personal.unlockAccount(myAddress, accountInfo.account_password, UNLOCK_ACCOUNT_INTERVAL)
            if (!ret) {
                return resp.json({ error: -20, data: "Failed to unlock for swapping" });
            }

            ret = await SwapEthForToken(
                web3, 
                {
                    chainId: 5,
                    sellAddress: myAddress,
                    sellSymbol: sellSymbol,
                    sellAmount: sellAmount,
                    buySymbol: buySymbol,
                    privateKey: accountInfo.secret_keys['ETH'],
                    acceptableMinRate: acceptableMinRate,
                    deadline: deadline
                }
            )
            return resp.json(ret);
        } catch (error) {
            let errorMessage = error.message.replace("Returned error: ", "");
            return resp.json({ error: -201, data: "Error 10051: " + errorMessage });
        }
    }
};

module.exports = AccountService;