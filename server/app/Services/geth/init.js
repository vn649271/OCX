var util = require('util');
require('dotenv').config();
const Web3 = require('web3');
const net = require('net');
var fs = require("fs");
const { json } = require('body-parser');

const CHAIN_NAME = process.env.CHAIN_NAME == 'main' ? '' : process.env.CHAIN_NAME;
const CHAIN_ID = process.env.CHAIN_ID || 5;
const MSG__GETH_NOT_READY = "Geth node is not ready yet. Please retry a while later.";

var gethIpcTimer = null;
var web3 = null;

var ipcURL = null;

if (process.env.IPC_TYPE == "geth") {
    // For Linux
    var GETH_DATA_DIR = process.env.HOME + "/.ethereum/" + CHAIN_NAME
    ipcURL = GETH_DATA_DIR + "/geth.ipc";
    
    // For Windows
    if (process.platform.search('win32') >= 0) {
        GETH_DATA_DIR = process.env.LOCALAPPDATA + "\\Ethereum\\" + CHAIN_NAME;
        ipcURL = "\\\\.\\pipe\\geth.ipc";
    }
} else if (process.env.IPC_TYPE == 'ganache') {
    ipcURL = "HTTP://127.0.0.1:7545"; // Ganache
} else if (process.env.IPC_TYPE == 'infura') {
    ipcURL = "https://goerli.infura.io/v3/499740cc57444242b52f0c55033fcee0"
}
    
async function attachToGethIPC(ipcURL) {
    if (process.env.IPC_TYPE === 'ganache' || process.env.IPC_TYPE === 'infura') {
        let web3Provider = new Web3.providers.HttpProvider(ipcURL, net);
        web3 = new Web3(web3Provider);
        if (!web3) {
            return;
        }
        clearTimeout(gethIpcTimer);
        gethIpcTimer = null;
        console.log("Attached to " + process.env.IPC_TYPE.toUpperCase() + " RPC successfully");
    } else if (process.env.IPC_TYPE === 'geth') {
        fs.access(ipcURL, (err) => {
            if (!err) {
                let web3Provider = new Web3.providers.IpcProvider(ipcURL, net);
                web3 = new Web3(web3Provider);
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

gethIpcTimer = setTimeout(attachToGethIPC, 10000, ipcURL);

getWeb3Obj = (initWeb3) => {
    initWeb3(web3);
}

module.exports = {
    getWeb3Obj,
    MSG__GETH_NOT_READY
};