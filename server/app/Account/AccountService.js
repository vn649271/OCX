var util = require('util');
require('dotenv').config();
const jwt = require("jsonwebtoken");
const AccountModel = require("./AccountModel");
var { getWeb3Obj, MSG__GETH_NOT_READY } = require('../Services/geth/init');
// const Web3 = require('web3');
// const net = require('net');
// var fs = require("fs");
// const { json } = require('body-parser');
var keythereum = require("keythereum");
const axios = require('axios');
const { openchainRouterInstance, DEFAULT_DEADLINE } = require('../Services/OpenchainRouter');

const { ethers } = require("ethers")

const OUR_TOKENS = ["ETH", "UNI", "DAI", "PNFT", "OCAT"];

var gTokenList = {};
var gPriceList = {};
var gBalances = {};

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

var myEthAddress = null;
var accountModel = new AccountModel();

var self = null;
var web3 = null;
initWeb3 = (inited) => {
    web3 = inited;
}

/**
 * Controller for user authentication
 */
class AccountService {

    constructor() {
        self = this;
        this.gethError = null;
        setTimeout(getWeb3Obj, 12000, initWeb3);
    }

    async init() {
        
    }

    async _getPrivateKey(ethAddress, password) {
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
            var secretKey = await this._getPrivateKey(myEthAddress, accountPassword);
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
            var accounts = await web3.eth.personal.getAccounts();
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
            // var secretKey = await this._getPrivateKey(myEthAddress, accountPassword);
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
    async getTokenInfoList() {

        var tokenInfoList = [];
        // ./node_modules/crypto-icons-plus-<size_of_icon>/src/<crypto_slug>.png
        // First, get ERC20 token list

        OUR_TOKENS.forEach(symbol => {
            if (gTokenList[symbol] === undefined || gTokenList[symbol] === null || gTokenList[symbol].length < 1) {
                let name = null;
                let address = null;
                if (symbol === 'BTC') {
                    name = 'bitcoin';
                    address = 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh';
                } else if (symbol === 'ETH') {
                    name = 'ethereum';
                    address = '';
                } else {
                    name = symbol;
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
    async getBalances(accountInfo) {
        if (web3 == null) {
            return { error: -200, data: MSG__GETH_NOT_READY };
        }
        const ocRouter = await openchainRouterInstance(web3, accountInfo);
        if (!ocRouter) {
            return { error: -202, data: "Invalid account for you"};
        }
        try {
            OUR_TOKENS.forEach(async symbol => {
                var balance = 0;
                let balanceInWei = 0;
                if (symbol === "ETH") {
                    balanceInWei = await web3.eth.getBalance(ocRouter.getMyAddress());
                    balance = web3.utils.fromWei(balanceInWei, 'ether');
                } else {
                    let ret = await ocRouter.getBalance(symbol);
                    if (ret.error !== 0) {
                        return { error: -250, data: "Failed to get balance for " + symbol };
                    }
                    balance = ret.data;
                }
                gBalances[symbol] = balance;
            });
            return { error: 0, data: gBalances };
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
            if (process.env.IPC_TYPE != "ganache") {
                let ret = await web3.eth.personal.unlockAccount(myEthAddress, accountInfo.account_password, UNLOCK_ACCOUNT_INTERVAL);
                if (!ret) {
                    return { error: -250, data: "Failed to unlock for sending" };
                }
            }
            let txHash = await web3.eth.sendTransaction({
                "from": myEthAddress,
                "to": toAddress,
                "value": amountToSend,
                "gasLimit": "21000"
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
            let ret = null;
            const ocRouter = await openchainRouterInstance(web3, accountInfo);
            if (!ocRouter) {
                return { error: -202, data: "Invalid account for you"};
            }
            ret = await ocRouter.getBestPrice({
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
            let ret = null;
            if (process.env.IPC_TYPE != "ganache") {
                ret = await web3.eth.personal.unlockAccount(myAddress, accountInfo.account_password, UNLOCK_ACCOUNT_INTERVAL)
                if (!ret) {
                    return { error: -250, data: "Failed to unlock for swapping" };
                }
            }
            const ocRouter = await openchainRouterInstance(web3, accountInfo);
            if (!ocRouter) {
                return { error: -252, data: "Invalid account for you"};
            }
            ret = await ocRouter.getBestPrice({
                sellSymbol: sellSymbol,
                sellAmount: sellAmount,
                buySymbol: buySymbol,
            });
            if (!ret || ret.data === undefined) {
                return { error: -251, data: "Failed to calculate minimum amount out" };
            }
            if (sellSymbol === 'ETH') {
                ret = await ocRouter.swapEthForToken(
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
                ret = await ocRouter.swapTokenForEth(
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
                ret = await ocRouter.swapTokenForToken(
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

    getPriceList = async(resp, accountInfo) => {
        if (web3 == null) {
            return { error: -200, data: "Geth node is not ready yet. Please retry a while later." }
        }
        if (accountInfo.addresses == undefined || accountInfo.addresses == {}) {
            return { error: -201, data: "No account for you" };
        }
        let ret = null;
        const ocRouter = await openchainRouterInstance(web3, accountInfo);
        if (!ocRouter) {
            return { error: -202, data: "Invalid account for you"};
        }
        try {
            ocRouter.getPriceList(resp);
        } catch (error) {
            return { error: -300, data: error }
        }
    }
};

module.exports = AccountService;