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

// const {
//     erc20BalanceOf,
//     swapEthForToken,
//     swapTokenForEth,
//     swapTokenForToken,
//     DEFAULT_DEADLINE
// } = require('../Services/Uniswap/Swap/SwapImpl'); // Services/Uniswap/Swap
const { ERC20TokenTransact, DEFAULT_DEADLINE } = require('../Services/Uniswap/Swap/ERC20TokenTransact');

const { ethers } = require("ethers")
const { getTokenInfo } = require('erc20-token-list');

const UNLOCK_ACCOUNT_INTERVAL = process.env.UNLOCK_ACCOUNT_INTERVAL || 15000; // 15s
const CHAIN_NAME = process.env.CHAIN_NAME || "goerli";
const CHAIN_ID = process.env.CHAIN_ID || 5;

var gTokenList = null;
const ALL_TOKEN_INFO_URL = "https://tokens.coingecko.com/uniswap/all.json";
async function getTokenList() {
    try {
        const response = await axios.get(ALL_TOKEN_INFO_URL);
        if (response.status !== 200) {
            console.error("Failed to get token list");
            return;
        }
        gTokenList = response.data.tokens;
        console.log(response);
    } catch (error) {
        console.error(error);
    }
}
getTokenList();

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
            return { error: 0, data: newAccountInfo.addresses };
        } catch (err) {
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
            let tokenInfo = {};
            switch (symbol) {
                case "BTC":
                    tokenInfo = {
                        symbol: "BTC",
                        logo: "./node_modules/crypto-icons-plus-64/src/bitcoin.png"
                    }
                    break;
                case "ETH":
                    tokenInfo = {
                        symbol: "ETC",
                        logo: "./node_modules/crypto-icons-plus-64/src/ethereum.png"
                    }
                    break;
                case "UNI":
                    let _tokenInfo = getTokenInfo(symbol);
                    tokenInfo = {
                        symbol: "ETC",
                        logo: "./node_modules/crypto-icons-plus-64/src/ethereum.png"
                    }
                    break;
            }
            if (tokenInfo === null) {
                return { error: -201, data: symbol };
            }
            if (!tokenInfo.logo.src) {
                tokenInfo.logo.src = "https://raw.githubusercontent.com/compound-finance/token-list/master/assets/asset_" + symbol + ".svg";
            }
            tokenInfoList.push({
                symbol: tokenInfo.symbol,
                logo: tokenInfo.logo.src,
            });
        });
        return { error: 0, data: tokenInfoList }
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
        const erc20TokenTransact = new ERC20TokenTransact(web3, myAddress);

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

            if (sellSymbol === 'ETH') {
                ret = await erc20TokenTransact.swapEthForToken(
                    web3,
                    {
                        sellSymbol: sellSymbol,
                        sellAmount: sellAmount,
                        buySymbol: buySymbol,
                        privateKey: accountInfo.secret_keys['ETH'],
                        acceptableMinRate: acceptableMinRate,
                        deadline: deadline
                    }
                )
            } else if (buySymbol === 'ETH') {
                ret = await erc20TokenTransact.swapTokenForEth(
                    web3,
                    {
                        sellSymbol: sellSymbol,
                        sellAmount: sellAmount,
                        buySymbol: buySymbol,
                        privateKey: accountInfo.secret_keys['ETH'],
                        acceptableMinRate: acceptableMinRate,
                        deadline: deadline
                    }
                )
            } else {
                ret = await erc20TokenTransact.swapTokenForToken(
                    web3,
                    {
                        sellSymbol: sellSymbol,
                        sellAmount: sellAmount,
                        buySymbol: buySymbol,
                        privateKey: accountInfo.secret_keys['ETH'],
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