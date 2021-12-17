const jwt = require("jsonwebtoken");
const Phone = require("../models/Firestore/Account");
require('dotenv').config();

var me;


/**
 * Controller for user authentication
 */
class AccountController {
    constructor() {
        me = this;
    }

    /**
     * Create an account in blockchain for user
     * @param {object} req request object from the client 
     * @param {object} resp response object to the client
     */
    create = (req, resp) => {
        return resp.json({ error: 0, data: "" });
    }

    /**
     * Connect to the specified wallet address
     * @param {object} req request object from the client 
     * @param {object} resp response object to the client
     */
    connectToWallet = (req, resp) => {
        return resp.json({ error: 0, data: "" });
    }

    /**
     * @param {object} req request object from the client 
     * @param {object} resp response object to the client
     */
    balance = (req, resp) => {
        return resp.json({ error: 0, data: "" });
    }

    /**
     * @param {object} req request object from the client
     * @param {object} resp response object to the client
     */
    send = (req, resp) => {
        return resp.json({ error: 0, data: "" });
    }
};

module.exports = AccountController;
