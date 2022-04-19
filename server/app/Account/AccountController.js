require('dotenv').config();
const PasswordGenerator = require('generate-password');
const AccountModel = require("./AccountModel");
const AccountService = require("./AccountService");
const CommonUtils = require('../utils/CommonUtils');
const UserAuthController = require('../UserAuth/UserAuthController');

var self = null;
var accountModel = new AccountModel();
var accountService = new AccountService();
var userController = new UserAuthController();
var commonUtils = new CommonUtils();

/**
 * Controller for user authentication
 */
class AccountController {
    
    constructor() {
        self = this;
        this.gethError = null
    }

    _setGethError(errStr) {
        this.gethError = errStr;
    }

    /**
     * Create an account in blockchain for user
     * @param {object} req request object from the client 
     * @param {object} resp response object to the client
     */
    create = async (req, resp) => {
        const userToken = req.body ? req.body.userToken ? req.body.userToken : null : null;
        if (userToken === null) {
            return resp.json({ error: -1, data: "Invalid request" });
        }
        let userInfo = userController.validateUserToken(userToken);
        if (!userInfo) {
            return resp.json({ error: -2, data: "Invalid user token or internet disconnected" });
        }
        const userPassword = req.body ? req.body.password ? req.body.password : null : null;
        if (userPassword === null) {
            return resp.json({ error: -3, data: "Invalid password" });
        }
        var passphrase = req.body ? req.body.passphrase ? req.body.passphrase : null : null;
        if (passphrase === null) {
            return resp.json({ error: -4, data: "Invalid passphrase" });
        }
        try {
            // !!!!!!!!!!!!! Decrypt passphrase
            passphrase = await commonUtils.decrypt(passphrase, userInfo.decrypt_key);
            if (!passphrase) {
                return resp.json({ error: -50, data: "Invalid passphrase." });
            }
            // !!!!!!!!!!!!! Check if the passphrase exists
            var accountInfo = await self.getById(userInfo.account);
            if (accountInfo) {
                return resp.json({ error: -50, data: "The passphrase exists. Plese generate another one and retry." });
            }
            var accountPassword = PasswordGenerator.generate({
                length: 20,
                numbers: true
            });
            let newAccountObj = await accountModel.create({
                user_token: userToken,
                user_password: userPassword,
                passphrase: passphrase,
                account_password: accountPassword,
                addresses: {
                    ETH: null,
                    BTC: null,
                    LP: null
                },
                secret_keys: {
                    ETH: null,
                    BTC: null,
                    LP: null
                },
                locked: false
            });
            if (newAccountObj === null) {
                return resp.json({ error: -51, data: "Failed to create new account" });
            }
            let addresses = await accountService.create(newAccountObj, resp);
            if (!addresses || addresses.error) {
                return resp.json({ error: -52, data: "Failed to create new onchain-account" });
            }
            let ret = await userController.setAccountId(userInfo.id, newAccountObj.id);
            if (!ret) {
                return resp.json({ error: -53, data: "Failed to link new account" });
            }
            return resp.json(addresses);
        } catch (error) {
            let errorMessage = error.message.replace("Returned error: ", "");
            return resp.json({ error: -100, data: errorMessage });
        }
    }

    /**
     * Restore an account in blockchain for user
     * @param {object} req request object from the client 
     * @param {object} resp response object to the client
     */
    restore = async(req, resp) => {
        const userToken = req.body ? req.body.userToken ? req.body.userToken : null : null;
        if (userToken === null) {
            return resp.json({ error: -1, data: "Invalid request" });
        }
        const userPassword = req.body ? req.body.password ? req.body.password : null : null;
        if (userPassword === null) {
            return resp.json({ error: -2, data: "Invalid password" });
        }
        var passphrase = req.body ? req.body.passphrase ? req.body.passphrase : null : null;
        if (passphrase === null) {
            return resp.json({ error: -3, data: "Invalid passphrase" });
        }
        try {
            let userInfo = userController.validateUserToken(userToken);
            if (!userInfo) {
                return resp.json({ error: -50, data: "Invalid user token or internet disconnected" });
            }
            // !!!!!!!!!!!!! Decrypt passphrase
            passphrase = await commonUtils.decrypt(passphrase, userInfo.decrypt_key);
            var retObj = await accountService.getByPassphrase(passphrase);
            if (retObj.error != 0) {
                return resp.json({ error: -51, data: "Invalid passphrase" });
            }
            let accountInfo = retObj.data;
            // var accountInfo = await self.getById(userInfo.account);
            if (accountInfo === undefined || accountInfo === null) {
                return resp.json({ error: -52, data: "Failed to get account from passphrase" });
            }
            // Recovery the account with private key and account's password
            var ret = await accountService.recovery(accountInfo);
            if (!ret) {
                return resp.json({ error: -53, data: "Failed to recovery the account" });
            }
            var ret = await accountModel.setUserToken(accountInfo.id, userToken);
            if (!ret) {
                return resp.json({
                    error: -53,
                    data: "Failed to set user token"
                });
            }
            ret = await accountModel.setUserPassword(accountInfo.id, userPassword);
            if (!ret) {
                return resp.json({
                    error: -54,
                    data: "Failed to set user password"
                });
            }
            return resp.json({
                error: 0,
                data: accountInfo.addresses
            });
        } catch (error) {
            let errorMessage = error.message.replace("Returned error: ", "");
            return resp.json({ error: -100, data: errorMessage });
        }
    }

    /**
     * Get information  for my account including account address
     * @param {object} req 
     * @param {object} resp 
     * @returns 
     */
    connect = async(req, resp) => {
        var userToken = req.body ? req.body.userToken ? req.body.userToken : null : null;
        if (userToken === null) {
            return resp.json({ error: -1, data: "Invalid request" });
        }
        let userInfoObj = userController.validateUserToken(userToken);
        if (!userInfoObj) {
            return resp.json({ error: -2, data: "Invalid user token or internet disconnected" });
        }
        try {
            if (userInfoObj.account === undefined || !userInfoObj.account || userInfoObj.account == "") {
                return resp.json({ error: 51, data: "No account" });
            }
            let ret = await accountModel.getById(userInfoObj.account);
            if (ret === undefined || ret === null) {
                return resp.json({ error: 52, data: "Not found the account" });
            }
            return resp.json({
                error: 0,
                data: {
                    locked: ret.locked,
                    addresses: ret.addresses
                }
            });
        } catch (error) {
            let errorMessage = error.message.replace("Returned error: ", "");
            return resp.json({ error: -100, data: errorMessage });
        }
    }

    /**
     * @param {object} req request object from the client 
     * @param {object} resp response object to the client
     */
    balances = async(req, resp) => {
        var userToken = req.body ? req.body.userToken ? req.body.userToken : null : null;
        if (userToken === null) {
            return resp.json({ error: -1, data: "Invalid request" });
        }
        try {
            let userInfo = userController.validateUserToken(userToken);
            if (!userInfo) {
                return resp.json({ error: -50, data: "Invalid user token or internet disconnected" });
            }
            let accountInfo = await self.getById(userInfo.account);
            if (!accountInfo) {
                return resp.json({ error: -51, data: "Invalid account for get balance"});
            }
            let ret = await accountService.getBalances(accountInfo);
            return resp.json(ret);
        } catch (error) {
            let errorMessage = error.message.replace("Returned error: ", "");
            return resp.json({ error: -100, data: errorMessage });
        }
    }

    /**
     * @param {object} req request object from the client 
     * @param {object} resp response object to the client
     */
    lock = async (req, resp) => {
        var userToken = req.body ? req.body.userToken ? req.body.userToken : null : null;
        if (userToken === null) {
            return resp.json({ error: -1, data: "Invalid request" });
        }
        try {
            let ret = await accountService.setLock(userToken, true);
            return resp.json(ret);
        } catch (error) {
            let errorMessage = error.message.replace("Returned error: ", "");
            return resp.json({ error: -100, data: errorMessage });
        }
    }

    /**
     * @param {object} req request object from the client 
     * @param {object} resp response object to the client
     */
    unlock = async (req, resp) => {
        var userToken = req.body ? req.body.userToken ? req.body.userToken : null : null;
        if (userToken === null) {
            return resp.json({ error: -1, data: "Invalid request" });
        }
        var password = req.body.password ? req.body.password ? req.body.password : null : null;
        if (password === null) {
            return resp.json({ error: -2, data: "Please provide your password to unlock your account" });
        }
        try {
            let ret = await accountService.setLock(userToken, false, password);
            return resp.json(ret);
        } catch (error) {
            let errorMessage = error.message.replace("Returned error: ", "");
            return resp.json({ error: -100, data: errorMessage });
        }
    }

    tokenList = async(req, resp) => {
        var userToken = req.body ? req.body.userToken ? req.body.userToken : null : null;
        if (userToken === null) {
            return resp.json({ error: -1, data: "Invalid request" });
        }
        try {
            let ret = await accountService.getTokenInfoList();
            return resp.json(ret);
        } catch (error) {
            let errorMessage = error.message.replace("Returned error: ", "");
            return resp.json({ error: -100, data: errorMessage });
        }
    }

    tokenPriceRate = async(req, resp) => {
        var userToken = req.body ? req.body.userToken ? req.body.userToken : null : null;
        if (userToken === null) {
            return resp.json({ error: -1, data: "Invalid request" });
        }
        var tokenPair = req.body ? req.body.tokenPair ? req.body.tokenPair : null : null;
        if (tokenPair === null) {
            return resp.json({ error: -2, data: "Invalid token to sell" });
        }
        try {
            let ret = await accountService.getPricePair(tokenPair);
            return resp.json(ret);
        } catch (error) {
            let errorMessage = error.message.replace("Returned error: ", "");
            return resp.json({ error: -100, data: errorMessage });
        }
    }

    
    /**
     * @param {object} req request object from the client
     * @param {object} resp response object to the client
     */
    send = async(req, resp) => {
        let userToken = req.body ? req.body.userToken ? req.body.userToken : null : null;
        if (userToken === null) {
            return resp.json({ error: -1, data: "Invalid request" });
        }
        let toAddress = req.body ? req.body.toAddress ? req.body.toAddress : null : null;
        if (toAddress === null) {
            return resp.json({ error: -2, data: "Invalid destination address" });
        }
        let toAmount = req.body ? req.body.amount ? req.body.amount : 0 : 0;
        if (toAmount === 0) {
            return resp.json({ error: -3, data: "Invalid sending amount" });
        }
        let userPassword = req.body ? req.body.password ? req.body.password : null : null;
        if (userPassword === null) {
            return resp.json({ error: -4, data: "Wrong password" });
        }
        try {
            let userInfo = userController.validateUserToken(userToken);
            if (!userInfo) {
                return resp.json({ error: -50, data: "Invalid user token or internet disconnected" });
            }
            let accountInfo = await self.getById(userInfo.account);
            if (!accountInfo) {
                return resp.json({ error: -51, data: "Not found valid account" });
            }
            if (accountInfo.user_password !== userPassword) {
                return resp.json({ error: -52, data: "Wrong Password" });
            }
            let ret = await accountService.sendToken(accountInfo, 'ETH', toAddress, toAmount);
            return resp.json(ret);
        } catch (error) {
            let errorMessage = error.message.replace("Returned error: ", "");
            return resp.json({ error: -100, data: errorMessage });
        }
    }

    /**
     * @param {object} req request object from the client
     * @param {object} resp response object to the client
     */
    getBestPrice = async(req, resp) => {
        var userToken = req.body ? req.body.userToken ? req.body.userToken : null : null;
        if (userToken === null) {
            return resp.json({ error: -1, data: "Invalid request" });
        }
        let sellSymbol = req.body ? req.body.sellSymbol ? req.body.sellSymbol : null : null;
        if (sellSymbol === null) {
            return resp.json({ error: -3, data: "Invalid token symbol to sell" });
        }
        let sellAmount = req.body ? req.body.sellAmount ? req.body.sellAmount : 0 : 0;
        if (sellAmount === 0) {
            return resp.json({ error: -4, data: "Invalid amount to be exchanged" });
        }
        let buySymbol = req.body ? req.body.buySymbol ? req.body.buySymbol : 0 : 0;
        if (buySymbol === 0) {
            return resp.json({ error: -5, data: "Invalid amount to exchange" });
        }
        try {
            let userInfo = userController.validateUserToken(userToken);
            if (!userInfo) {
                return resp.json({ error: -50, data: "Invalid user token or internet disconnected" });
            }
            let accountInfo = await self.getById(userInfo.account);
            if (!accountInfo) {
                return resp.json({ error: -50, data: "Not found valid account" });
            }
            let ret = await accountService.getBestPrice({
                accountInfo: accountInfo,
                sellSymbol: sellSymbol,
                sellAmount: sellAmount,
                buySymbol: buySymbol,
            });
            return resp.json(ret);
        } catch (error) {
            let errorMessage = error.message.replace("Returned error: ", "");
            return resp.json({ error: -100, data: "Error 1050: " + errorMessage });
        }
    }

    /**
     * @param {object} req request object from the client
     * @param {object} resp response object to the client
     */
    swap = async(req, resp) => {
        var userToken = req.body ? req.body.userToken ? req.body.userToken : null : null;
        if (userToken === null) {
            return resp.json({ error: -1, data: "Invalid request" });
        }
        // let userPassword = req.body ? req.body.password ? req.body.password : null : null;
        // if (userPassword === null) {
        //     return resp.json({ error: -2, data: "Invalid password" });
        // }
        let sellSymbol = req.body ? req.body.sellSymbol ? req.body.sellSymbol : 0 : 0;
        if (sellSymbol === null) {
            return resp.json({ error: -3, data: "Invalid token symbol to sell" });
        }
        let sellAmount = req.body ? req.body.sellAmount ? req.body.sellAmount : 0 : 0;
        if (sellAmount === 0) {
            return resp.json({ error: -4, data: "Invalid amount to be exchanged" });
        }
        let buySymbol = req.body ? req.body.buySymbol ? req.body.buySymbol : 0 : 0;
        if (buySymbol === 0) {
            return resp.json({ error: -5, data: "Invalid amount to exchange" });
        }
        let slippage = req.body ? req.body.slippage ? req.body.slippage : 0 : 0;
        if (slippage === 0) {
            return resp.json({ error: -6, data: "Invalid slippage" });
        }
        let deadline = req.body ? req.body.deadline ? req.body.deadline : 0 : 0;
        if (deadline === 0) {
            return resp.json({ error: -7, data: "Invalid deadline" });
        }
        try {
            let userInfo = userController.validateUserToken(userToken);
            if (!userInfo) {
                return resp.json({ error: -50, data: "Invalid user token or internet disconnected" });
            }
            let accountInfo = await self.getById(userInfo.account);
            if (!accountInfo) {
                return resp.json({ error: -51, data: "Not found valid account" });
            }
            let ret = await accountService.swapBetweenERC20({
                accountInfo: accountInfo,
                sellSymbol: sellSymbol,
                sellAmount: sellAmount,
                buySymbol: buySymbol,
                slippage: slippage,   // 0.6 UNI
                deadline: deadline // 600s = 10min
            });
            return resp.json(ret);
        } catch (error) {
            let errorMessage = error.message.replace("Returned error: ", "");
            return resp.json({ error: -100, data: "Error 1050: " + errorMessage });
        }
    }

    getById = async accountId => {
        let accountInfo = await accountModel.getById(accountId);
        if (accountInfo === undefined) {
            return null;
        }
        return accountInfo;
    }

    addAsset = async (accountId, assetId) => {
        return await accountModel.addAsset(accountId, assetId);
    }

    /**
     * Find pawn asset information document by the specified conditions
     * @param {json} jsonWhere search condition to be used
     */
    allAsset = async accountId => {
        let accountInfo = await accountModel.getById(accountId);
        if (ret === undefined || ret === null) {
            return null;
        }
        if (process.env.IPC_TYPE === 'ganache') {
            return accountInfo.assets_ganache;
        }
        return accountInfo.assets;
    }

    getPrices = async(req, resp, next) => {
        var userToken = req.body ? req.body.userToken ? req.body.userToken : null : null;
        if (userToken === null) {
            return resp.json({ error: -1, data: "Invalid request" });
        }
        try {
            let userInfo = userController.validateUserToken(userToken);
            if (!userInfo) {
                return resp.json({ error: -50, data: "Invalid user token or internet disconnected" });
            }
            let accountInfo = await self.getById(userInfo.account);
            if (!accountInfo) {
                return resp.json({ error: -51, data: "Not found valid account" });
            }
            accountService.getPriceList(resp, accountInfo);
        } catch (error) {
            let errorMessage = error.message.replace("Returned error: ", "");
            return resp.json({ error: -100, data: errorMessage });
        }
    }
};

module.exports = AccountController;
