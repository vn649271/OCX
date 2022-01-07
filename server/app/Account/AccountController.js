require('dotenv').config();
const AccountModel = require("./AccountModel");
const AccountService = require("./AccountService");
const UserController = require("../controller/UserAuthController");
const { generate, generateMultiple } = require('generate-passphrase-id')

var self = null;
var accountModel = new AccountModel();
var accountService = new AccountService();
var userController = new UserController();

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
    create = (req, resp) => {
        if (req.body === null || req.body.userToken === undefined ||
            req.body.userToken === null) {
            return resp.json({ error: -1, data: "Invalid request" });
        }
        let ret = userController.validateUserToken(req.body.userToken);
        if (!ret < 0) {
            return resp.json({ error: -2, data: "Invalid user token" });
        }
        if (req.body === null || req.body.password === undefined ||
        req.body.password === null) {
            return resp.json({ error: -3, data: "Invalid password" });
        }

        const passphrase = generate({ length: 12, separator: ' ', titlecase: true });
        accountService.createAccount({
            userToken: req.body.userToken,
            password: req.body.password, 
            passphrase: passphrase,
            response: resp
        });
    }

    /**
     * Get information  for my account including account address
     * @param {object} req 
     * @param {object} resp 
     * @returns 
     */
    connect = (req, resp) => {
        var userToken = req.body? req.body.userToken? req.body.userToken: null: null;
        if (userToken === null) {
            return resp.json({ error: -2, data: "Invalid request" });
        }
        let ret = userController.validateUserToken(userToken);
        if (!ret < 0) {
            return resp.json({ error: -3, data: "Invalid user token" });
        }
        accountModel.findOne({
            where: {
                user_token: userToken
            }
        }).then(ret => {
            if (ret === undefined || ret === null) {
                return resp.json({ error: 1, data: "No account" });
            }
            return resp.json({  error: 0, data: ret.accounts.eth.address });
        }).catch(err => {
            return resp.json({ error: -4, data: err });
        });
    }

    /**
     * @param {object} req request object from the client 
     * @param {object} resp response object to the client
     */
    balance = (req, resp) => {
        var userToken = req.body ? req.body.userToken? req.body.userToken: null: null;
        if (userToken === null) {
            return resp.json({ error: -2, data: "Invalid request" });
        }
        let ret = userController.validateUserToken(userToken);
        if (!ret < 0) {
            return resp.json({ error: -3, data: "Invalid user token" });
        }
        accountModel.getAddresses(userToken).then(function(accounts) {
            if (accounts == undefined || accounts == null || accounts == {}) {
                console.log("No account");
                return resp.json({ error: -4, data: "No account for you"});
            }
            accountService.balance(accounts, 'eth', resp);
        }).catch(error => {
            return resp.json({error: -6, data: error});
        });
    }

    /**
     * @param {object} req request object from the client 
     * @param {object} resp response object to the client
     */
    lock = (req, resp) => {
        var userToken = req.body ? req.body.userToken? req.body.userToken: null: null;
        if (userToken === null) {
            return resp.json({ error: -2, data: "Invalid request" });
        }
        let ret = userController.validateUserToken(userToken);
        if (!ret < 0) {
            return resp.json({ error: -3, data: "Invalid user token" });
        }
        accountService.lock(userToken, resp);
    }

    /**
     * @param {object} req request object from the client 
     * @param {object} resp response object to the client
     */
    unlock = (req, resp) => {
        var userToken = req.body ? req.body.userToken? req.body.userToken: null: null;
        if (userToken === null) {
            return resp.json({ error: -2, data: "Invalid request" });
        }
        let ret = userController.validateUserToken(userToken);
        if (!ret < 0) {
            return resp.json({ error: -3, data: "Invalid user token" });
        }
        accountService.unlock(userToken, resp);
    }

    /**
     * @param {object} req request object from the client
     * @param {object} resp response object to the client
     */
    send = (req, resp) => {
        var userToken = req.body ? req.body.userToken? req.body.userToken: null: null;
        if (userToken === null) {
            return resp.json({ error: -2, data: "Invalid request" });
        }
        let ret = userController.validateUserToken(req.body.userToken);
        if (!ret < 0) {
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

        accountModel.findOne({
            where: {
                user_token: userToken
            }
        }).then(accountInfo => {
            if (accountInfo == undefined || accountInfo.accounts == undefined || accountInfo.accounts == {}) {
                console.log("No account");
                return resp.json({ error: -5, data: "No account for you"});
            }
            accountService.sendToken(accountInfo, 'eth', toAddress, toAmount, resp);
        }).catch(error => {
            return resp.json({error: -8, data: error});
        });
    }
};

module.exports = AccountController;