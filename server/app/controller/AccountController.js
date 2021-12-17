const jwt = require("jsonwebtoken");
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
     * Create an account for blockchain
     * @param {object} req request object from the client 
     * @param {object} res response object to the client
     */
     create = (req, res) => {

    }

    /**
     * Connect to the specified wallet address
     * @param {object} req request object from the client 
     * @param {object} res response object to the client
     */
    connectToWallet = (req, res) => {
    }

    /**
     * @param {object} req request object from the client 
     * @param {object} res response object to the client
     */
    balance = (req, res) => {
    }

    /**
     * @param {object} req request object from the client
     * @param {object} res response object to the client
     */
    send = (req, res) => {
    }
};

module.exports = AccountController;
