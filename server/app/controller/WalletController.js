var util = require('util');
require('dotenv').config();
var exec = require('child_process').exec;
const jwt = require("jsonwebtoken");
const User = require("../models/Firestore/Users");
const Phone = require("../models/Firestore/Account");
const CommonUtils = require('../utils/CommonUtils');
const net = require('net');
const Web3 = require('web3');
var Tx = require('ethereumjs-tx').Transaction;

let commonUtils = new CommonUtils();

var userModel = new User();

const ETHER_NETWORK = process.env.ETHER_NETWORK || "goerli";

const ipcPath = process.env.HOME + "/.ethereum/" + ETHER_NETWORK + "/geth.ipc";
const web3 = new Web3(new Web3.providers.IpcProvider(ipcPath, net));


var self;

/**
 * Controller for user authentication
 */
class WalletController {
    constructor() {
        self = this;

        this.chainName = (ETHER_NETWORK === '.'? 'main': ETHER_NETWORK);
        console.log("********* Current chain name: '", this.chainName, "'");
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
        if (!ret || ret.error < 0) {
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
        if (!ret || ret.error < 0) {
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
        if (!ret || ret.error < 0) {
            return resp.json({ error: -2, data: "Invalid user token" });
        }
        let account = userModel.getAccount(userToken);
        web3.eth.getBalance(account).then(function(balance) {
            console.log("WalletController.balance(): balance = ", balance);
            resp.json({error: 0, data: balance});
        });
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
        if (!ret || ret.error < 0) {
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
        var sendingInfo = {
            myAddress: ret.ether.address,
            lastNonce: ret.ether.nonce - 0,
            toaddress: req.body.toAddress,
            amount: req.body.amount * 1000000000000000000
        }
        console.log(CommonUtils.globalSettings);
        var privateKey = Buffer.from('e331b6d69882b4cb4ea581d88e0b604039a3de5967688d3dcffdd2270c0fd109', 'hex');
        
        var rawTx = {
            nonce: sendingInfo.lastNonce + 1,
            gasPrice: '0x09184e72a000',
            gasLimit: '0x2710',
            to: sendingInfo.toAddress,
            value: sendingInfo.amount,
            data: 'OpenchainDex Test Transaction'
        }
        
        var tx = new Tx(rawTx, {'chain': this.chainName});

        tx.sign(privateKey);
        
        var serializedTx = tx.serialize();
        
        // console.log(serializedTx.toString('hex'));
        // 0xf889808609184e72a00082271094000000000000000000000000000000000000000080a47f74657374320000000000000000000000000000000000000000000000000000006000571ca08a8bbf888cfa37bbf0bb965423625641fc956967b81d12e23709cead01446075a01ce999b56a8a88504be365442ea61239198e23d1fce7d00fcfc5cd3b44b7215f
        
        web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
        .on('transactionHash', function(hash){
            // When retrieve transaction hash
            console.log("The transaction retrieved a hash: ", hash);
        })
        .on('receipt', function(receipt){
            console.log("The transaction retrieved receipt: ", receipt);
        })
        .on('confirmation', function(confirmationNumber, receipt) { 
            // When the transaction confirmed
            console.log("The transaction confirmed: Confirmation number: ", confirmationNumber, receipt);
        })
        .on('error', console.log); // If a out of gas error, the second parameter is the receipt.

        return resp.json({ error: 0, data: "" });
    }
};

module.exports = WalletController;
