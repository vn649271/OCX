require('dotenv').config();
const PasswordGenerator = require('generate-password');
const AccountModel = require("./AccountModel");
const AccountService = require("./AccountService");
const UserController = require("../UserAuth/UserAuthController");
const CommonUtils = require('../utils/CommonUtils');

var self = null;
var accountModel = new AccountModel();
var accountService = new AccountService();
var userController = new UserController();
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
    async create(req, resp) {
        const userToken = req.body ? req.body.userToken ? req.body.userToken : null : null;
        if (userToken === null) {
            return resp.json({ error: -1, data: "Invalid request" });
        }
        let userInfo = await userController.validateUserToken(userToken);
        if (!userInfo) {
            return resp.json({ error: -2, data: "Invalid user token" });
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
            // !!!!!!!!!!!!! Check if the passphrase exists
            var accountInfo = await accountModel.findOne({
                where: {
                    passphrase: passphrase,
                }
            });
            if (accountInfo) {
                return resp.json({ error: -50, data: "The passphrase exists. Plese generate another one and retry." });
            }
            var accountPassword = PasswordGenerator.generate({
                length: 10,
                numbers: true
            });
            let newAccountInfo = await accountModel.create({
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
            if (newAccountInfo === null) {
                return resp.json({ error: -51, data: "Failed to create a new account" });
            }
            let ret = await accountService.create(newAccountInfo, resp);
            return resp.json(ret);
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
    async restore(req, resp) {
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
            let userInfo = await userController.validateUserToken(userToken);
            if (!userInfo) {
                return resp.json({ error: -50, data: "Invalid user token" });
            }
            // !!!!!!!!!!!!! Decrypt passphrase
            passphrase = await commonUtils.decrypt(passphrase, userInfo.decrypt_key);

            var accountInfo = await accountModel.findOne({
                where: {
                    passphrase: passphrase,
                }
            })
            if (accountInfo === undefined || accountInfo === null) {
                return resp.json({ error: -51, data: "Invalid passphrase" });
            }
            var ret = await accountModel.setUserToken(accountInfo.id, userToken);
            if (!ret) {
                return resp.json({
                    error: -52,
                    data: "Failed to set user token"
                });
            }
            ret = await accountModel.setUserPassword(accountInfo.id, userPassword);
            if (!ret) {
                return resp.json({
                    error: -53,
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
    async connect(req, resp) {
        var userToken = req.body ? req.body.userToken ? req.body.userToken : null : null;
        if (userToken === null) {
            return resp.json({ error: -1, data: "Invalid request" });
        }
        try {
            let ret = await accountModel.findOne({
                where: {
                    user_token: userToken
                }
            });
            if (ret === undefined || ret === null) {
                return resp.json({ error: 51, data: "No account" });
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
    async balance(req, resp) {
        var userToken = req.body ? req.body.userToken ? req.body.userToken : null : null;
        if (userToken === null) {
            return resp.json({ error: -1, data: "Invalid request" });
        }
        try {
            let userInfo = await userController.validateUserToken(userToken);
            if (!userInfo) {
                return resp.json({ error: -50, data: "Invalid user token" });
            }
            var addresses = await accountModel.getAddresses(userToken);
            if (addresses == undefined || addresses == null || addresses == {}) {
                return resp.json({ error: -51, data: "No account for you" });
            }
            let ret = await accountService.balance(addresses, ['ETH', 'UNI', 'DAI']);
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
    async lock(req, resp) {
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
    async unlock(req, resp) {
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

    async tokenList(req, resp) {
        var userToken = req.body ? req.body.userToken ? req.body.userToken : null : null;
        if (userToken === null) {
            return resp.json({ error: -1, data: "Invalid request" });
        }
        try {
            let ret = await accountService.getTokenInfoList(["BTC", "ETH", "UNI", "DAI"]);
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
    async send(req, resp) {
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
            let userInfo = await userController.validateUserToken(userToken);
            if (!userInfo) {
                return resp.json({ error: -50, data: "Invalid user token" });
            }
            let accountInfo = await accountModel.findOne({
                where: {
                    user_token: userToken
                }
            });
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
    async swap(req, resp) {
        var userToken = req.body ? req.body.userToken ? req.body.userToken : null : null;
        if (userToken === null) {
            return resp.json({ error: -1, data: "Invalid request" });
        }
        let userPassword = req.body ? req.body.password ? req.body.password : null : null;
        if (userPassword === null) {
            return resp.json({ error: -2, data: "Invalid password" });
        }
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
        try {
            let accountInfo = await accountModel.findOne({ where: { user_token: userToken } });
            if (!accountInfo) {
                return resp.json({ error: -50, data: "Not found valid account" });
            }
            let ret = await accountService.swapBetweenERC20({
                accountInfo: accountInfo,
                sellSymbol: sellSymbol,
                sellAmount: sellAmount,
                buySymbol: buySymbol,
                acceptableMinRate: 0.0,   // 0.6 UNI
                deadline: 600 // 600s = 10min
            });
            return resp.json(ret);
        } catch (error) {
            let errorMessage = error.message.replace("Returned error: ", "");
            return resp.json({ error: -100, data: "Error 1050: " + errorMessage });
        }
    }
};

module.exports = AccountController;