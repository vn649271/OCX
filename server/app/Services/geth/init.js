var util = require('util');
require('dotenv').config();
const Web3 = require('web3');
const net = require('net');
var fs = require("fs");
const { json } = require('body-parser');

const CHAIN_NAME = process.env.CHAIN_NAME || "goerli";
const CHAIN_ID = process.env.CHAIN_ID || 5;
const MSG__GETH_NOT_READY = "Geth node is not ready yet. Please retry a while later.";

var gethIpcTimer = null;
var web3 = null;
var gethProvider = null;

// For Linux
var GETH_DATA_DIR = process.env.HOME + "/.ethereum/" + CHAIN_NAME
var ipcPath = GETH_DATA_DIR + "/geth.ipc";

// For Windows
if (process.platform.search('win32') >= 0) {
    GETH_DATA_DIR = process.env.LOCALAPPDATA + "\\Ethereum\\" + CHAIN_NAME;
    ipcPath = "\\\\.\\pipe\\geth.ipc";
}

// In case of Ganache
if (process.env.BLOCKCHAIN_EMULATOR !== undefined &&
process.env.BLOCKCHAIN_EMULATOR !== null &&
process.env.BLOCKCHAIN_EMULATOR === "ganache") {
    ipcPath = "HTTP://127.0.0.1:7545"; // Ganache
}
    
async function attachToGethIPC(ipcPath) {
    if (process.env.BLOCKCHAIN_EMULATOR === "ganache") {
        gethProvider = new Web3.providers.HttpProvider(ipcPath, net);
        web3 = new Web3(gethProvider);
        if (!web3) {
            return;
        }
        clearTimeout(gethIpcTimer);
        gethIpcTimer = null;
        console.log("Attached to Ganache RPC successfully");
    } else {
        fs.access(ipcPath, (err) => {
            if (!err) {
                gethProvider = new Web3.providers.IpcProvider(ipcPath, net);
                web3 = new Web3(gethProvider);
                if (!web3) {
                    return;
                }
                clearTimeout(gethIpcTimer);
                gethIpcTimer = null;
                console.log("Attached to Geth IPC successfully");
            } else {
                console.log(err);
            }
        });
    }
}

gethIpcTimer = setTimeout(attachToGethIPC, 10000, ipcPath);

getWeb3Obj = (initWeb3) => {
    initWeb3(web3);
}

module.exports = {
    getWeb3Obj,
    MSG__GETH_NOT_READY
};