var util = require('util');
require('dotenv').config();
var exec = require('child_process').exec;
const jwt = require("jsonwebtoken");
const User = require("../models/Firestore/Users");
const Phone = require("../models/Firestore/Account");
const CommonUtils = require('../utils/CommonUtils');
let commonUtils = new CommonUtils();

var userModel = new User();

const { spawn } = require('child_process');

var geth = null;
var gethIpcActive = 1;
var gethIpcQueue = []; // Queue of response objects
var gethIpc = null;

var gethTimer = setTimeout(
    function() {
        geth = spawn('./geth', ['--goerli', '--syncmode', 'light']);
        geth.stdout.on('data', (data) => {
            console.log(`geth:stdout: ${data}`);
        });
        geth.stderr.on('data', (data) => {
            console.log(`geth:stderr: ${data}`);
        });
        geth.on('close', (code) => {
            console.log(`geth: child process exited with code ${code}`);
        });
    },
    5000
);

var gethIpcTimer = setTimeout(
    function() {
        clearTimeout(gethIpcTimer);
        console.log("-----------------------------------------------GETH IPC ----------------------------------------");
        gethIpc = spawn('./geth', ['attach', process.env.HOME + '/.ethereum/goerli/geth.ipc']);
        gethIpc.stdout.on('data', (data) => {
            if (gethIpcQueue == []) {
                console.log("Geth IPC is empty");
                return;
            }
            let resp = gethIpcQueue.pop();
            if (resp == undefined || resp == null) {
                console.log("Response object from Geth IPC is invalid");
                return;
            }
            resp.json({ error: 0, data: data });
            gethIpcOutput = data;
            // console.log(`geth-ipc: stdout: ${data}`);
        });
        gethIpc.stderr.on('data', (data) => {
            console.log(`geth-ipc: stderr: ${data}`);
        });
        gethIpc.on('close', (code) => {
            gethIpcActive = 0;
            console.log(`geth-ipc: child process exited with code ${code}`);
        });
    }, 
    30000
);

inputGethCmd = (cmdString, resp) => {
    gethIpcQueue.push(resp);
    if (gethIpc == null) {
        return { error: -20, data: "Failed to connect IPC" };
    }
    gethIpc.stdin.write(cmdString);
    var gethIpcTimer = setTimeout(function() {
        return { error: -21, data: "Getting balance is timeout" };
    }, 3000);
}

var self;

/**
 * Controller for user authentication
 */
class WalletController {
    constructor() {
        self = this;
        // Create a signer account
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
        let ret = userModel.validateUserToken(req.body.userToken);
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
        let ret = userModel.validateUserToken(req.body.userToken);
        if (!ret) {
            return resp.json({ error: -2, data: "Invalid user token" });
        }

        return resp.json({ error: 0, data: "" });
    }

    /**
     * @param {object} req request object from the client 
     * @param {object} resp response object to the client
     */
    balance = (req, resp, next) => {
        if (req.params === undefined || req.params.userToken === undefined ||
        req.params.userToken === null) {
            return resp.json({ error: -1, data: "Invalid request" });
        }
        let userToken = req.params.userToken;
        let ret = userModel.validateUserToken(userToken);
        if (!ret) {
            return resp.json({ error: -2, data: "Invalid user token" });
        }
        let account = userModel.getAccount(userToken);
        inputGethCmd('web3.fromWei(eth.getBalance("' + account + '"),"ether")\n', resp);
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
        let ret = userModel.validateUserToken(req.body.userToken);
        if (!ret) {
            return resp.json({ error: -2, data: "Invalid user token" });
        }

        console.log(CommonUtils.globalSettings);

        return resp.json({ error: 0, data: "" });
    }
};

module.exports = WalletController;
