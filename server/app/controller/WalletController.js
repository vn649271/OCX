var util = require('util');
require('dotenv').config();
const { exec, spawn } = require('child_process');
const jwt = require("jsonwebtoken");
const User = require("../models/Firestore/Users");
const Phone = require("../models/Firestore/Account");
var fs = require("fs");
const net = require('net');
const Web3 = require('web3');
var Tx = require('ethereumjs-tx').Transaction;
const CommonUtils = require('../utils/CommonUtils');

let commonUtils = new CommonUtils();

var userModel = new User();

var self = null;

const ETHER_NETWORK = process.env.ETHER_NETWORK || "goerli";

var geth = spawn('geth', ['--goerli', '--syncmode', 'light']);
geth.stdout.on('data', (data) => {
    console.log(`geth:stdout: ${data}`);
});
geth.stderr.on('data', (data) => {
    console.log("ggggggggggggggggggggggggggggg: ", typeof data);
    if (typeof data === 'object') {
        let retStr = new Buffer.from(data).toString();
        if (retStr.length > 4 && retStr.substring(0, 5) === 'INFO ') {
          return; // If string is INFO message, ignore
        }
        if (self !== null) {
            self.setGethError(retStr);
        }
    }
    console.log(`geth:stderr: ${data}`);
});
geth.on('close', (code) => {
    console.log(`geth: child process exited with code ${code}`);
});

var web3 = null;
// const ipcPath = process.env.HOME + "/.ethereum/" + ETHER_NETWORK + "/geth.ipc";
const ipcPath = "\\\\.\\pipe\\geth.ipc";

var gethIpcTimer = setTimeout(
    function() {
        fs.access(ipcPath, (err) => {
          if (!err) {
            web3 = new Web3(new Web3.providers.IpcProvider(ipcPath, net));
            if (!web3) {
                return;
            }
            clearTimeout(gethIpcTimer);
            gethIpcTimer = null;
            return;
          }
          console.log('&&&&&&&&&&&&&&&&&&& Geth does not exist yet');
        });
    },
    5000
);



/**
 * Controller for user authentication
 */
class WalletController {
    constructor() {
        self = this;
        this.gethError = null
        this.chainName = (ETHER_NETWORK === '.'? 'main': ETHER_NETWORK).trim();
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
        if (web3 == null) {
            return resp.json({ error: -3, data: "Geth node is not ready yet. Please retry a while later."})
        }
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
            resp.json({error: 0, data: balance});
        });
    }

    /**
     * @param {object} req request object from the client
     * @param {object} resp response object to the client
     */
    send = (req, resp) => {
        if (web3 == null) {
            return resp.json({ error: -3, data: "Geth node is not ready yet. Please retry a while later."})
        }
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
            amount: req.body.amount
        }

        web3.eth.getBlock("latest").then(function(latestBlock) {
            if (latestBlock === undefined || latestBlock === null) {
                return resp.json({ error: -11, data: "Failed to get latest block" });
            }
            var gasPrice = latestBlock.gasPrice;//or get with web3.eth.gasPrice
            var gasLimit = latestBlock.gasLimit;
            var nonce = web3.eth.getTransactionCount(sendingInfo.myAddress); //211;

            var rawTransaction = {
                "from": sendingInfo.myAddress,
                "nonce": web3.utils.toHex(nonce),
                "gasPrice": web3.utils.toHex(gasPrice/* * 0x1e9*/),
                "gasLimit": web3.utils.toHex(gasLimit),
                "to": sendingInfo.toAddress,
                "value": web3.utils.toHex(sendingInfo.amount),
                "chainId": 5 //remember to change this
            };
          
            var tx = new Tx(rawTransaction, {'chain': self.chainName});

            var privateKey = Buffer.from('9fe71fcea7a64c4f1e6e6c90d34d869367f13ad94392f3ed6117ff9969922979', 'hex');
            tx.sign(privateKey);
            
            var serializedTx = tx.serialize();
            
            // console.log(serializedTx.toString('hex'));
            // 0xf889808609184e72a00082271094000000000000000000000000000000000000000080a47f74657374320000000000000000000000000000000000000000000000000000006000571ca08a8bbf888cfa37bbf0bb965423625641fc956967b81d12e23709cead01446075a01ce999b56a8a88504be365442ea61239198e23d1fce7d00fcfc5cd3b44b7215f
            
            web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
            .on('transactionHash', function(hash){
                // When retrieve transaction hash
                console.log("The transaction retrieved a hash: ", hash);
                return resp.json({ error: 0, data: hash });
            })
            .on('receipt', function(receipt){
                console.log("The transaction retrieved receipt: ", receipt);
                return resp.json({ error: 1, data: receipt });
            })
            .on('confirmation', function(confirmationNumber, receipt) { 
                // When the transaction confirmed
                console.log("The transaction confirmed: Confirmation number: ", confirmationNumber, receipt);
                return resp.json({ error: 2, data: receipt });
            })
            .on('error', function(err) {
                console.log("1111111111111111111111111111111111: ", err);
                let errStr = self.gethError;
                console.log("2222222222222222222222222222222222: ", errStr);
                return resp.json({ error: -10, data: errStr });
            }); // If a out of gas error, the second parameter is the receipt.
            
        });
    }
};

module.exports = WalletController;
