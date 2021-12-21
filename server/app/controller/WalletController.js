var util = require('util');
require('dotenv').config();
var exec = require('child_process').exec;
const jwt = require("jsonwebtoken");
const Phone = require("../models/Firestore/Account");
const CommonUtils = require('../utils/CommonUtils');
let commonUtils = new CommonUtils();

var Web3 = require('web3');
// var web3 = new Web3(Web3.givenProvider || 'ws://localhost:8545');

var me;

/**
 * Controller for user authentication
 */
class WalletController {
    constructor() {
        me = this;
        // Create a signer account
    }

    getBalance = (signer) => {
    }

    _create(password, resp) {
        let command = "geth account new";
        exec(command, function (error, stdout, stderr) {
            if (stdout.length < 1) {
                return resp.json({ error: -10, message: "Failed to create a new account." });
            }
            const obj = JSON.parse(stdout);
            return resp.json({ error: 0, data: "" });
        });
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
        let ret = commonUtils.validateUserToken(req.body.userToken);
        if (!ret) {
            return resp.json({ error: -2, data: "Invalid user token" });
        }
        if (req.body === null || req.body.password === undefined ||
        req.body.password === null) {
            return resp.json({ error: -3, data: "Invalid password" });
        }

        return this._create(req.body.password, resp);
    }

    /**
     * Connect to the specified wallet address
     * @param {object} req request object from the client 
     * @param {object} resp response object to the client
     */
    connectToWallet = (req, resp) => {
        if (req.body === null || req.body.userToken === undefined ||
            req.body.userToken === null) {
            return resp.json({ error: -1, data: "Invalid request" });
        }
        let ret = commonUtils.validateUserToken(req.body.userToken);
        if (!ret) {
            return resp.json({ error: -2, data: "Invalid user token" });
        }

        return resp.json({ error: 0, data: "" });
    }

    /**
     * @param {object} req request object from the client 
     * @param {object} resp response object to the client
     */
    balance = (req, resp) => {
        if (req.body === null || req.body.userToken === undefined ||
            req.body.userToken === null) {
            return resp.json({ error: -1, data: "Invalid request" });
        }
        let ret = commonUtils.validateUserToken(req.body.userToken);
        if (!ret) {
            return resp.json({ error: -2, data: "Invalid user token" });
        }

        return resp.json({ error: 0, data: "" });
    }

    /**
     * @param {object} req request object from the client
     * @param {object} resp response object to the client
     */
    send = (req, resp) => {
        if (req.body === null || req.body.userToken === undefined ||
            req.body.userToken === null) {
            return resp.json({ error: -1, data: "Invalid request" });
        }
        let ret = commonUtils.validateUserToken(req.body.userToken);
        if (!ret) {
            return resp.json({ error: -2, data: "Invalid user token" });
        }

        console.log(CommonUtils.globalSettings);

        return resp.json({ error: 0, data: "" });
    }
};

module.exports = WalletController;
