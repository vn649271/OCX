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

    setGethError(errStr) {
        this.gethError = errStr;
    }

    /**
     * Create an account in blockchain for user
     * @param {object} req request object from the client 
     * @param {object} resp response object to the client
     */
    async create(req, resp) {
        const userToken = req.body? req.body.userToken ? req.body.userToken: null: null;
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
        // !!!!!!!!!!!!! Decrypt passphrase
        passphrase = await commonUtils.decrypt(passphrase, userInfo.decrypt_key);
        // !!!!!!!!!!!!! Check if the passphrase exists
        var accountInfo = await accountModel.findOne({
            where: {
                passphrase: passphrase,
            }
        });
        if (accountInfo) {
            return resp.json({ error: -5, data: "The passphrase exists. Plese generate another one and retry." });
        }
        var accountPassword = PasswordGenerator.generate({
            length: 10,
            numbers: true
        });
        accountModel.create({
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
        }).then(newAccountInfo => {
            accountService.create(newAccountInfo, resp);
        })
        .catch(error => {
            let errorMessage = error.message.replace("Returned error: ", "");
            return resp.json({error: -200, data: "Error 1000: " + errorMessage});
        });
    }

    /**
     * Restore an account in blockchain for user
     * @param {object} req request object from the client 
     * @param {object} resp response object to the client
     */
    async restore(req, resp) {
        const userToken = req.body? req.body.userToken ? req.body.userToken: null: null;
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
        // !!!!!!!!!!!!! Decrypt passphrase
        passphrase = await commonUtils.decrypt(passphrase, userInfo.decrypt_key);

        var accountInfo = await accountModel.findOne({
            where: {
                passphrase: passphrase,
            }
        })
        if (accountInfo === undefined || accountInfo === null) {
            return resp.json({ error: -5, data: "Invalid passphrase" });
        }
        var ret = await accountModel.setUserToken(accountInfo.id, userToken);
        if (!ret) {
            return resp.json({
                error: -6,
                data: "Failed to set user token"
            });
        }
        ret = await accountModel.setUserPassword(accountInfo.id, userPassword);
        if (!ret) {
            return resp.json({
                error: -7,
                data: "Failed to set user password"
            });
        }
        return resp.json({
            error: 0,
            data: accountInfo.addresses
        });
    }

    /**
     * Get information  for my account including account address
     * @param {object} req 
     * @param {object} resp 
     * @returns 
     */
    async connect(req, resp) {
        var userToken = req.body? req.body.userToken? req.body.userToken: null: null;
        if (userToken === null) {
            return resp.json({ error: -2, data: "Invalid request" });
        }
        let ret = await accountModel.findOne({
            where: {
                user_token: userToken
            }
        });
        if (ret === undefined || ret === null) {
            return resp.json({ error: 1, data: "No account" });
        }
        return resp.json({  
            error: 0, 
            data: {
                user_token: userToken,
                locked: ret.locked,
                addresses: ret.addresses
            }
        });
    }

    /**
     * @param {object} req request object from the client 
     * @param {object} resp response object to the client
     */
    async balance(req, resp) {
        var userToken = req.body ? req.body.userToken? req.body.userToken: null: null;
        if (userToken === null) {
            return resp.json({ error: -2, data: "Invalid request" });
        }
        let userInfo = await userController.validateUserToken(userToken);
        if (!userInfo) {
            return resp.json({ error: -2, data: "Invalid user token" });
        }
        var addresses = await accountModel.getAddresses(userToken);
        if (addresses == undefined || addresses == null || addresses == {}) {
            return resp.json({ error: -4, data: "No account for you"});
        }
        accountService.balance(addresses, 'ETH', resp);
    }

    /**
     * @param {object} req request object from the client 
     * @param {object} resp response object to the client
     */
    async lock(req, resp) {
        var userToken = req.body ? req.body.userToken? req.body.userToken: null: null;
        if (userToken === null) {
            return resp.json({ error: -2, data: "Invalid request" });
        }
        let userInfo = await userController.validateUserToken(userToken);
        if (!userInfo) {
            return resp.json({ error: -2, data: "Invalid user token" });
        }
        accountService.lock(userInfo, resp);
    }

    /**
     * @param {object} req request object from the client 
     * @param {object} resp response object to the client
     */
    async unlock(req, resp) {
        var userToken = req.body ? req.body.userToken? req.body.userToken: null: null;
        if (userToken === null) {
            return resp.json({ error: -2, data: "Invalid request" });
        }
        let ret = userController.validateUserToken(userToken);
        if (!ret) {
            return resp.json({ error: -3, data: "Invalid user token" });
        }
        let userPassword = req.body? req.body.password ? req.body.password : null : null;
        accountModel.findOne({
            where: {
                user_token: userToken
            }
        }).then(accountInfo => {
            if (accountInfo) {
                if (accountInfo.user_password === userPassword) {
                    return accountService.unlock(userToken, resp);
                }
                return resp.json({ error: -4, data: "Wrong Password" });
            }
            return resp.json({ error: -5, data: "Invalid user token" });
        }).catch(error => {
            let errorMessage = error.message.replace("Returned error: ", "");
            return resp.json({error: -200, data: "Error 1040: " + errorMessage});
        });
    }

    /**
     * @param {object} req request object from the client
     * @param {object} resp response object to the client
     */
    async send (req, resp) {
        var userToken = req.body ? req.body.userToken? req.body.userToken: null: null;
        if (userToken === null) {
            return resp.json({ error: -2, data: "Invalid request" });
        }
        let userInfo = await userController.validateUserToken(userToken);
        if (!userInfo) {
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
        let userPassword = req.body? req.body.password ? req.body.password : null : null;

        var toAddress = req.body.toAddress;
        var toAmount = req.body.amount;

        accountModel.findOne({
            where: {
                user_token: userToken
            }
        }).then(accountInfo => {
            if (accountInfo) {
                if (accountInfo.user_password === userPassword) {
                    accountService.sendToken(accountInfo, 'ETH', toAddress, toAmount, resp);
                }
                return resp.json({ error: -5, data: "Wrong Password" });
            }
            return resp.json({ error: -6, data: "Invalid user token" });
        }).catch(error => {
            let errorMessage = error.message.replace("Returned error: ", "");
            return resp.json({error: -200, data: "Error 1050: " + errorMessage});
        });
    }

    /**
     * @param {object} req request object from the client
     * @param {object} resp response object to the client
     */
    async swap (req, resp) {
        var userToken = req.body ? req.body.userToken? req.body.userToken: null: null;
        if (userToken === null) {
            return resp.json({ error: -2, data: "Invalid request" });
        }
        let userInfo = userController.validateUserToken(userToken);
        if (!userInfo) {
            return resp.json({ error: -3, data: "Invalid user token" });
        }
        let userPassword = req.body? req.body.password ? req.body.password : null : null;

        accountService.swapEthToERC20(
            userInfo,
            {
                buySymbol:          "DAI",
                sellAmount:         0.01,
                acceptableMinRate:  3000,   // 3000 DAI
                deadline:           600 // 600s = 10min
            },
            resp
        );        
    }
};

module.exports = AccountController;