var util = require('util');
require('dotenv').config();
var exec = require('child_process').exec;
const jwt = require("jsonwebtoken");
const Phone = require("../models/Firestore/Account");
const CommonUtils = require('../utils/CommonUtils');
let commonUtils = new CommonUtils();

const { spawn } = require('child_process');
const geth = spawn('geth', ['--goerli', '--syncmode', 'light', 'console']);
const gethIpc = spawn('geth', ['attach', process.env.HOME + '/.ethereum/goerli/geth.ipc']);

var gethIpcActive = 1;
var gethIpcSemaphor = 0;
var gethIpcOutput = null;

geth.stdout.on('data', (data) => {
    console.log(`geth:stdout: ${data}`);
});
geth.stderr.on('data', (data) => {
    console.error(`geth:stderr: ${data}`);
});
geth.on('close', (code) => {
    console.log(`geth: child process exited with code ${code}`);
});

gethIpc.stdout.on('data', (data) => {
    gethIpcSemaphor --;
    if (gethIpcSemaphor < 0)
        gethIpcSemaphor = 0;
    gethIpcOutput = data;
    // console.log(`geth-ipc: stdout: ${data}`);
});
gethIpc.stderr.on('data', (data) => {
    console.error(`geth-ipc: stderr: ${data}`);
});
gethIpc.on('close', (code) => {
    gethIpcActive = 0;
    console.log(`geth-ipc: child process exited with code ${code}`);
});

var self;

/**
 * Controller for user authentication
 */
class WalletController {
    constructor() {
        self = this;
        // Create a signer account
    }

    getBalance = (signer) => {
    }

    _create(password, resp) {
        let command = "geth account new";
        exec(command, function (error, stdout, stderr) {
            if (stdout.length < 1) {
                return resp.json({ error: -10, data: "Failed to create a new account." });
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
        gethIpcSemaphor++;
        geth.stdin.write('web3.fromWei(eth.getBalance("0xc408888C550A11b8942e4Ffc9907b17706D8B3a4"),"ether")\n');
        var gethIpcTimer = setTimeout(function() {
            return resp.json({ error: -3, data: "Getting balance is timeout" });
        }, 3000);
        while (gethIpcActive && gethIpcSemaphor);
        if (!gethIpcActive) {
            if (gethIpcTimer) {
                clearTimeout(gethIpcTimer);
            }
            return resp.json({ error: -4, data: "Failed to connect geth IPC" });
        }
console.log("balance: ", gethIpcOutput);
        return resp.json({ error: 0, data: gethIpcOutput });
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
