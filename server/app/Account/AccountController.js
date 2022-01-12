require('dotenv').config();
const AccountModel = require("./AccountModel");
const AccountService = require("./AccountService");
const UserController = require("../UserAuth/UserAuthController");

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

    decryptPassphrase(encryptedPasshrase) {

    }

    /**
     * Create an account in blockchain for user
     * @param {object} req request object from the client 
     * @param {object} resp response object to the client
     */
    create = (req, resp) => {
        const userToken = req.body? req.body.userToken ? req.body.userToken: null: null;
        if (userToken === null) {
            return resp.json({ error: -1, data: "Invalid request" });
        }
        let ret = userController.validateUserToken(req.body.userToken);
        if (!ret < 0) {
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
        passphrase = this.decryptPassphrase(passphrase);
        // !!!!!!!!!!!!! Check if the passphrase exists
        accountModel.findOne({
            where: {
                passphrase: passphrase,
            }
        }).then(accountInfo => {
            if (accountInfo) {
                return resp.json({ error: -5, data: "The passphrase exists. Plese generate another one and retry." });
            }
            const accountPassword = generatePassword(); // ???????????????????????

            accountModel.create({
                user_token: userToken,
                user_password: userPassword,
                passphrase: passphrase,
                account_password: accountPassword,
                addresses: {
                    eth: null,
                    btc: null,
                    lp: null
                },
                secret_keys: {
                    eth: null,
                    btc: null,
                    lp: null
                },
                locked: false
            }).then(newAccountInfo => {
                accountService.create(newAccountInfo, resp);
            })
            .catch(error => {
                let errorMessage = error.message.replace("Returned error: ", "");
                return resp.json({error: -200, data: "Error 1000: " + errorMessage});
            });
        }).catch(error => {
            let errorMessage = error.message.replace("Returned error: ", "");
            return resp.json({error: -200, data: "Error 1001: " + errorMessage});
        });
    }

    /**
     * Restore an account in blockchain for user
     * @param {object} req request object from the client 
     * @param {object} resp response object to the client
     */
    restore = (req, resp) => {
        const userToken = req.body? req.body.userToken ? req.body.userToken: null: null;
        if (userToken === null) {
            return resp.json({ error: -1, data: "Invalid request" });
        }
        let ret = userController.validateUserToken(req.body.userToken);
        if (!ret < 0) {
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
        passphrase = this.decryptPassphrase(passphrase);

        accountModel.findOne({
            where: {
                passphrase: passphrase,
            }
        }).then(accountInfo => {
            if (accountInfo === undefined || accountInfo === null) {
                return resp.json({ error: -5, data: "Invalid passphrase" });
            }
            var ret = accountModel.setUserToken(accountInfo.accountInfo.id, userToken);
            if (!ret) {
                return resp.json({
                    error: -6,
                    data: "Failed to set user token"
                });
            }
            ret = accountModel.setUserPassword(accountInfo.accountInfo.id, userPassword);
            if (!ret) {
                return resp.json({
                    error: -7,
                    data: "Failed to set user password"
                });
            }
            return resp.json({
                error: 0,
                data: accountInfo.accounts
            });
        }).catch(error => {
            let errorMessage = error.message.replace("Returned error: ", "");
            return resp.json({error: -200, data: "Error 1010: " + errorMessage});
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
            return resp.json({  
                error: 0, 
                data: {
                    locked: ret.locked,
                    addresses: {
                        eth: ret.accounts.eth.address
                    }
                }
            });
        }).catch(error => {
            let errorMessage = error.message.replace("Returned error: ", "");
            return resp.json({error: -200, data: "Error 1020: " + errorMessage});
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
                return resp.json({ error: -4, data: "No account for you"});
            }
            accountService.balance(accounts, 'eth', resp);
        }).catch(error => {
            let errorMessage = error.message.replace("Returned error: ", "");
            return resp.json({error: -200, data: "Error 1030: " + errorMessage});
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
                    accountService.sendToken(accountInfo, 'eth', toAddress, toAmount, resp);
                }
                return resp.json({ error: -5, data: "Wrong Password" });
            }
            return resp.json({ error: -6, data: "Invalid user token" });
        }).catch(error => {
            let errorMessage = error.message.replace("Returned error: ", "");
            return resp.json({error: -200, data: "Error 1050: " + errorMessage});
        });
    }
};

module.exports = AccountController;