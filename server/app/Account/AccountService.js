var util = require('util');
require('dotenv').config();
const jwt = require("jsonwebtoken");
const AccountModel = require("./AccountModel");
const Web3 = require('web3');
const net = require('net');
var fs = require("fs");
const { json } = require('body-parser');
var keythereum = require("keythereum");
const axios = require('axios');
const { ERC20TokenTransact, DEFAULT_DEADLINE } = require('../Services/Uniswap/Swap/ERC20TokenTransact');

const { ethers } = require("ethers")

const UNLOCK_ACCOUNT_INTERVAL = process.env.UNLOCK_ACCOUNT_INTERVAL || 15000; // 15s
const CHAIN_NAME = process.env.CHAIN_NAME || "goerli";
const CHAIN_ID = process.env.CHAIN_ID || 5;

var gTokenList = {};
var gPriceList = {};

async function getTokenList() {
    try {
        const response = await axios.get(process.env.ALL_TOKEN_INFO_URL);
        if (response.status !== 200) {
            console.error("Failed to get token list");
            return;
        }
        let tokens = response.data.tokens;
        if (tokens === undefined || tokens === null || tokens.length === 0) {
            console.error("Got invalid token list");
            return;
        }
        tokens.forEach(tokenInfo => {
            gTokenList[tokenInfo.symbol] = [];
            gTokenList[tokenInfo.symbol].push(tokenInfo);
        })
    } catch (error) {
        console.error(error);
    }
}
// getTokenList();

const MSG__GETH_NOT_READY = "Geth node is not ready yet. Please retry a while later.";

// For Linux
var GETH_DATA_DIR = process.env.HOME + "/.ethereum/" + CHAIN_NAME
var ipcPath = GETH_DATA_DIR + "/geth.ipc";
// In case of Ganache
if (process.env.BLOCKCHAIN_EMULATOR !== undefined &&
process.env.BLOCKCHAIN_EMULATOR !== null &&
process.env.BLOCKCHAIN_EMULATOR === "ganache") {
    ipcPath = "HTTP://127.0.0.1:7545"; // Ganache
}

// For Windows
if (process.platform.search('win32') >= 0) {
    GETH_DATA_DIR = process.env.LOCALAPPDATA + "\\Ethereum\\" + CHAIN_NAME;
    ipcPath = "\\\\.\\pipe\\geth.ipc";
}

var gethIpcTimer = null;
var web3 = null;
var myEthAddress = null;
var accountModel = new AccountModel();
var gethProvider = null;

async function attachToGethIPC(ipcPath) {
    if (process.env.BLOCKCHAIN_EMULATOR === "ganache") {
        gethProvider = new Web3.providers.HttpProvider(ipcPath, net);
        web3 = new Web3(gethProvider);
        if (!web3) {
            return;
        }
        clearTimeout(gethIpcTimer);
        gethIpcTimer = null;
        console.log("Attached to Geth IPC successfully");
    } else {
        fs.access(ipcPath, (err) => {
            if (!err) {
                gethProvider = new Web3.providers.IpcProvider(ipcPath, net);
                web3 = new Web3(gethProvider);
                if (!web3) {
                    return;
                }
                clearTimeout(gethIpcTimer);
                gethIpcTimer = null;
                console.log("Attached to Geth IPC successfully");
            } else {
                console.log(err);
            }
        });
    }
}

gethIpcTimer = setTimeout(attachToGethIPC, 10000, ipcPath);

var self = null;

/**
 * Controller for user authentication
 */
class AccountService {

    constructor() {
        self = this;
        this.gethError = null
    }

    async _getPrivateKey(password, ethAddress) {
        // Get private key for new account
        var keyObject = keythereum.importFromFile(ethAddress, GETH_DATA_DIR);
        // var privateKey = keythereum.recover(params.password, keyObject);
        return await keythereum.recover(password, keyObject);
    }

    /**
     * @param {object} newAccountInfoObj list of symbols for getting info of
     */
    async create(newAccountInfoObj) {
        if (web3 == null) {
            console.log("AccountService.createAccount(): Geth node is not ready yet. Please retry a while later.");
            return { error: -200, data: MSG__GETH_NOT_READY };
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
                return { error: -250, data: "Created account address invalid" };
            }
            // Next, get private key
            var secretKey = await this._getPrivateKey(accountPassword, myEthAddress);
            if (!secretKey) {
                return { error: -251, data: "Invalid private key" };
            }
            secretKey = secretKey.toString('hex');
            // Final, Save them
            const ret = await accountModel.updateKeyPairs(accountId, 'ETH', myEthAddress, secretKey);
            if (!ret) {
                return { error: -252, data: "Failed to save key paire" };
            }
            newAccountInfo.addresses['ETH'] = myEthAddress;
            newAccountInfo.secret_keys['ETH'] = secretKey;
            return { error: 0, data: newAccountInfo.addresses };
        } catch (error) {
            let errorMessage = error.message.replace("Returned error: ", "");
            return { error: -300, data: "Error 10000: " + errorMessage };
        }
    }

    /**
     * @param {object} newAccountInfoObj list of symbols for getting info of
     */
     async recovery(accountInfo) {
        if (web3 == null) {
            console.log("AccountService.createAccount(): Geth node is not ready yet. Please retry a while later.");
            return { error: -200, data: MSG__GETH_NOT_READY };
        }
        try {
            var ethereumAddress = accountInfo.addresses['ETH'];
            var accounts = await await web3.eth.personal.getAccounts();
            var alreadyExists = false;
            accounts.map((v, i) => {
                if (v == ethereumAddress) {
                    alreadyExists = true;
                    return;
                }
            });
            if (alreadyExists) {
                return { error: 1, data: accountInfo.addresses };
            }
            var privateKey = accountInfo.secret_keys['ETH'];
            var accountPassword = accountInfo.account_password;
            // Generate public and private keys
            // First, get public key
            var myEthAddress = await web3.eth.personal.importRawKey(privateKey, accountPassword);
            if (myEthAddress && myEthAddress.length !== 42) {
                return { error: -250, data: "Created account address invalid" };
            }
            // // Next, get private key
            // var secretKey = await this._getPrivateKey(accountPassword, myEthAddress);
            // if (!secretKey) {
            //     return { error: -251, data: "Invalid private key" };
            // }
            // secretKey = secretKey.toString('hex');
            // Final, Save them
            const ret = await accountModel.updateKeyPairs(accountId, 'ETH', myEthAddress, privateKey);
            if (!ret) {
                return { error: -252, data: "Failed to save key paire" };
            }
            return { error: 0, data: newAccountInfo.addresses };
        } catch (error) {
            let errorMessage = error.message.replace("Returned error: ", "");
            return { error: -300, data: "Error 10000: " + errorMessage };
        }
    }


    /**
     * @param {object} symbolList list of symbols for getting info of
     */
    async getTokenInfoList(symbolList) {
        if (symbolList === null) {
            return { error: -200, data: null };
        }
        var tokenInfoList = [];
        // ./node_modules/crypto-icons-plus-<size_of_icon>/src/<crypto_slug>.png
        // First, get ERC20 token list

        symbolList.forEach(symbol => {
            if (gTokenList[symbol] === undefined || gTokenList[symbol] === null || gTokenList[symbol].length < 1) {
                let name = null;
                let address = null;
                if (symbol === 'BTC') {
                    name = 'bitcoin';
                    address = 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh';
                } else if (symbol === 'ETH') {
                    name = 'ethereum';
                    address = '';
                }
                tokenInfoList.push({
                    address: '',
                    chainId: 1,
                    decimals: 18,
                    logoURI: './node_modules/crypto-icons-plus-64/src/' + name + '.png',
                    name: name,
                    symbol: symbol
                });
            } else {
                tokenInfoList.push(gTokenList[symbol][0]);
            }
        });
        return { error: 0, data: tokenInfoList }
    }

    async getPricePair(tokePair) {
        try {
            let url = process.env.PRICE_HISTORY_URL.replace('@@@', tokePair[0]);
            url = url.replace('###', tokePair[1]);
            const response = await axios.get(url);
            if (response.status !== 200) {
                return { error: -250, data: "Failed to get price pair" };
            }
            let prices = response.data ?
                response.data.Data ?
                    response.data.Data.Data ?
                        response.data.Data.Data : null
                    : null
                : null;
            if (prices === undefined || prices === null || prices.length === 0) {
                return { error: -251, data: "Got invalid price pair" };
            }
            let priceRate = (prices[0].open + prices[0].close) / 2;
            gPriceList[tokePair[0] + "-" + tokePair[1]] = priceRate;
            return { error: 0, data: priceRate };
        } catch (error) {
            console.error(error);
            return { error: -300, data: null }
        }
    }

    /**
     * @param {object} req request object from the client 
     */
    async balance(addresses, tokens) {
        if (web3 == null) {
            return { error: -200, data: MSG__GETH_NOT_READY };
        }
        let myEthAddress = addresses['ETH'];
        const erc20TokenTransact = new ERC20TokenTransact(web3, myEthAddress);
        try {
            let balances = {};
            for (let i in tokens) {
                let symbol = tokens[i];
                let balance = 0;
                let balanceInWei = 0;
                if (symbol === "ETH") {
                    balanceInWei = await web3.eth.getBalance(myEthAddress);
                } else {
                    let ret = await erc20TokenTransact.getBalance(symbol);
                    if (ret.error !== 0) {
                        return { error: -250, data: "Failed to get balance for " + symbol };
                    }
                    balanceInWei = ret.data;
                }
                balance = web3.utils.fromWei(balanceInWei, 'ether');
                balances[symbol] = balance;
            }
            return { error: 0, data: balances };
        } catch (error) {
            let errorMessage = error.message.replace("Returned error: ", "");
            return { error: -300, data: errorMessage };
        }
    }

    /**
     * @param {object} userToken request object from the client
     */
    async setLock(userToken, lock = true, userPassword = null) {
        try {
            let accountInfo = await accountModel.findOne({
                where: {
                    user_token: userToken
                }
            });
            if (accountInfo === undefined || accountInfo === null) {
                return { error: -250, data: 'No account' };
            }
            if (!lock) {
                if (userPassword === null || userPassword != accountInfo.user_password) {
                    return { error: -251, data: 'Invalid password for unlock' };
                }
            }
            let ret = await accountModel.setLock(accountInfo.id, lock);
            if (!ret) {
                return { error: -252, data: "Failed to lock account" };
            }
            return { error: 0, data: ret };
        } catch (error) {
            let errorMessage = error.message.replace("Returned error: ", "");
            return { error: -300, data: errorMessage };
        }
    }

    /**
     * @param {object} accountInfo request object from the client
     * @param {object} token response object to the client
     * @param {object} toAddress response object to the client
     * @param {object} toAmount response object to the client
     */
    async sendToken(accountInfo, token, toAddress, toAmount) {
        if (web3 == null) {
            return { error: -200, data: "sendToken(): Geth node is not ready yet. Please retry a while later." };
        }
        if (accountInfo == undefined || accountInfo.addresses == undefined || accountInfo.addresses == {}) {
            return { error: -201, data: "sendToken(): No account for you" };
        }
        var addresses = accountInfo.addresses;
        myEthAddress = addresses[token];
        var amountToSend = web3.utils.toWei(toAmount.toString(), "ether");
        try {
            let ret = await web3.eth.personal.unlockAccount(myEthAddress, accountInfo.account_password, UNLOCK_ACCOUNT_INTERVAL);
            if (!ret) {
                return { error: -250, data: "Failed to unlock for sending" };
            }
            let txHash = await web3.eth.sendTransaction({
                "from": myEthAddress,
                "to": toAddress,
                "value": amountToSend
            })
            if (!txHash) {
                return { error: -251, data: "Failed to send token" };
            }
            return { error: 0, data: txHash };
        } catch (error) {
            let errorMessage = error.message.replace("Returned error: ", "");
            return { error: -300, data: errorMessage };
        }
    }

    async _getSigner(accountInfo, chain) {
        try {
            const provider = new ethers.providers.Web3Provider(gethProvider)
            const wallet = new ethers.Wallet(accountInfo.secret_keys[chain], provider)
            return wallet;
        } catch (error) {
            let errorMessage = error.message.replace("Returned error: ", "");
            return { error: -300, data: errorMessage };
        }
    }

    /**
     * @param {object} req request object from the client
     * @param {object} resp response object to the client
     */
    async getBestPrice(params) {
        if (web3 == null) {
            return { error: -200, data: "Geth node is not ready yet. Please retry a while later." }
        }
        var accountInfo = params ? params.accountInfo ? params.accountInfo : null : null,
            sellSymbol = params ? params.sellSymbol ? params.sellSymbol : null : null,
            sellAmount = params ? params.sellAmount ? params.sellAmount : 0 : 0,
            buySymbol = params ? params.buySymbol ? params.buySymbol : null : null;

        if (accountInfo.addresses == undefined || accountInfo.addresses == {}) {
            return { error: -201, data: "No account for you" };
        }
        if (sellSymbol === null) {
            return { error: -202, data: "Invalid token to sell" };
        }
        if (sellAmount === 0) {
            return { error: -203, data: "Invalid amount to sell" };
        }
        if (buySymbol === null) {
            return { error: -205, data: "Invalid token to buy" };
        }
        var addresses = accountInfo.addresses;
        if (addresses['ETH'] === undefined || addresses['ETH'] === null) {
            return { error: -206, data: "Invalid your address for swapping" };
        }
        var myAddress = addresses['ETH'];

        sellAmount = web3.utils.toWei(sellAmount.toString(), "ether");
        try {
            let ret = await web3.eth.personal.unlockAccount(myAddress, accountInfo.account_password, UNLOCK_ACCOUNT_INTERVAL)
            if (!ret) {
                return { error: -250, data: "Failed to unlock for swapping" };
            }
            const erc20TokenTransact = new ERC20TokenTransact(web3, myAddress);
            ret = await erc20TokenTransact.getBestPrice({
                sellSymbol: sellSymbol,
                sellAmount: sellAmount,
                buySymbol: buySymbol,
            });
            if (ret.error < 0) {
                ret.error = -251;
                return ret;
            }
            ret.data = sellAmount = web3.utils.fromWei(ret.data.toString(), "ether");
            return ret;
        } catch (error) {
            let errorMessage = error.message.replace("Returned error: ", "");
            return { error: -300, data: errorMessage };
        }
    }

    /**
     * @param {object} req request object from the client
     * @param {object} resp response object to the client
     */
    async swapBetweenERC20(params) {
        if (web3 == null) {
            return { error: -200, data: "Geth node is not ready yet. Please retry a while later." }
        }
        var accountInfo = params ? params.accountInfo ? params.accountInfo : null : null,
            sellSymbol = params ? params.sellSymbol ? params.sellSymbol : null : null,
            sellAmount = params ? params.sellAmount ? params.sellAmount : 0 : 0,
            buySymbol = params ? params.buySymbol ? params.buySymbol : null : null,
            acceptableMinRate = params ? params.acceptableMinRate ? params.acceptableMinRate : 0 : 0,
            deadline = params ? params.deadline ? params.deadline : DEFAULT_DEADLINE : DEFAULT_DEADLINE;

        if (accountInfo.addresses == undefined || accountInfo.addresses == {}) {
            return { error: -201, data: "No account for you" };
        }
        if (sellSymbol === null) {
            return { error: -202, data: "Invalid token to sell" };
        }
        if (sellAmount === 0) {
            return { error: -203, data: "Invalid amount to sell" };
        }
        if (acceptableMinRate < 0) {
            return { error: -204, data: "Invalid slippage" };
        }
        if (buySymbol === null) {
            return { error: -205, data: "Invalid token to buy" };
        }

        var addresses = accountInfo.addresses;
        if (addresses['ETH'] === undefined || addresses['ETH'] === null) {
            return { error: -206, data: "Invalid your address for swapping" };
        }
        var myAddress = addresses['ETH'];

        sellAmount = web3.utils.toWei(sellAmount.toString(), "ether");
        const nowInSeconds = Math.floor(Date.now() / 1000)
        deadline = nowInSeconds + 600; // 600s = 10min
        acceptableMinRate = web3.utils.toHex((acceptableMinRate - 0) * 10 ** 18);

        try {
            // const signer = await this._getSigner(accountInfo, "ETH");
            let ret = await web3.eth.personal.unlockAccount(myAddress, accountInfo.account_password, UNLOCK_ACCOUNT_INTERVAL)
            if (!ret) {
                return { error: -250, data: "Failed to unlock for swapping" };
            }
            const erc20TokenTransact = new ERC20TokenTransact(web3, myAddress);
            ret = await erc20TokenTransact.getBestPrice({
                sellSymbol: sellSymbol,
                sellAmount: sellAmount,
                buySymbol: buySymbol,
            });
            if (!ret || ret.data === undefined) {
                return { error: -251, data: "Failed to calculate minimum amount out" };
            }
            if (sellSymbol === 'ETH') {
                ret = await erc20TokenTransact.swapEthForToken(
                    {
                        sellSymbol: sellSymbol,
                        sellAmount: sellAmount,
                        buySymbol: buySymbol,
                        buyAmountMin: ret.data,
                        acceptableMinRate: acceptableMinRate,
                        deadline: deadline
                    }
                )
            } else if (buySymbol === 'ETH') {
                ret = await erc20TokenTransact.swapTokenForEth(
                    {
                        sellSymbol: sellSymbol,
                        sellAmount: sellAmount,
                        buySymbol: buySymbol,
                        buyAmountMin: ret.data,
                        acceptableMinRate: acceptableMinRate,
                        deadline: deadline
                    }
                )
            } else {
                ret = await erc20TokenTransact.swapTokenForToken(
                    {
                        sellSymbol: sellSymbol,
                        sellAmount: sellAmount,
                        buySymbol: buySymbol,
                        buyAmountMin: ret.data,
                        acceptableMinRate: acceptableMinRate,
                        deadline: deadline,
                        // signer: signer
                    }
                )
            }
            return ret;
        } catch (error) {
            let errorMessage = error.message.replace("Returned error: ", "");
            return { error: -300, data: errorMessage };
        }
    }
};

module.exports = AccountService;