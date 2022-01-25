var util = require('util');
require('dotenv').config();
const Web3 = require('web3');
const net = require('net');
var fs = require("fs");
const { exec, spawn } = require('child_process');
const { json } = require('body-parser');

const readline = require('readline');

var rl = readline.createInterface({
    input: process. stdin,
    output: process. stdout
});

const AccountModel = require("../app/Account/AccountModel");

const UNLOCK_ACCOUNT_INTERVAL = process.env.UNLOCK_ACCOUNT_INTERVAL || 15000; // 15s
const CHAIN_NAME = process.env.CHAIN_NAME || "goerli";

// Attach to GETH node
// For Linux
var GETH_DATA_DIR = process.env.HOME + "/.ethereum/" + CHAIN_NAME
var ipcPath = GETH_DATA_DIR + "/geth.ipc";
if (process.platform.search('win32') >= 0) {
    // For Windows
    GETH_DATA_DIR = process.env.LOCALAPPDATA + "\\Ethereum\\" + CHAIN_NAME;
    ipcPath = "\\\\.\\pipe\\geth.ipc";
}

const myEthAddress = "0xc26de4dd0a5ccff5ee47f20b67e1f6adac53ad1f";
var myPasswd = "";

const BUILD_LIST = require("./build.json");

var web3 = null;

function runExternalProgram(extCmdName, paramArray, onClose = null, onCloseParams = null) {
    // Run GETH node for goerli testnet
    var extCmd = spawn(extCmdName, paramArray);
    extCmd.stdout.on('data', (data) => {
        console.log(extCmdName + `:stdout: ${data}`);
    });
    extCmd.stderr.on('data', (data) => {
        console.log(extCmdName + `:stderr: ${data}`);
    });
    extCmd.on('close', (code) => {
        console.log(extCmdName + `: child process exited with code ${code}`);
        if (!code && onClose) {
            onClose(onCloseParams);
        }
    });

    return extCmd;
}

const contract_creation_cb = function(error, contract) {
    if (error) {
        console.log("Error in creating contract", error);
    } else {
        if (!contract.address) {
            console.log("Contract transaction send: TransactionHash: " + contract.transactionHash + " waiting to be mind...");
        } else {
            console.log("Contract minded! Address: ", contract.address);
            address = contract.address;
            console.log(contract);
        }
    }
}

function compileContracts() {
    for (var i in BUILD_LIST) {
        buildContractAbi(BUILD_LIST[i]);
    }
}

function buildContractAbi(contractFileInfo) {
    runExternalProgram(
        'solcjs', 
        ["./" + contractFileInfo.source, '--abi'],
        compileContract,
        contractFileInfo
    );
}

function compileContract(contractFileInfo) {
    runExternalProgram(
        'solcjs', 
        ["./" + contractFileInfo.source, '--bin'], 
        deployContract, 
        contractFileInfo
    );
}

async function deployContract(contractFileInfo) {
    try {
        readContractAbiAndBin(contractFileInfo);
        rl.stdoutMuted = true;

        rl.question('Password: ', async function(password) {
            myPasswd = password;
            rl.close();

            let ret = await web3.eth.personal.unlockAccount(myEthAddress, myPasswd);
            if (!ret) {
                return { error: -1, data: "Failed to unlock for deploy" };
            }
            var newContract = new web3.eth.Contract(contractFileInfo.abi);
            console.log("-----------------------------------------------");
            newContract.deploy({
                data: contractFileInfo.bin,
                arguments: ['My String']
            })
            .send(
                {
                    from: myEthAddress,
                    gas: 0x47b760,
                },
                function(error, transactionHash) {
                    if (!error) {
                        console.log("Deploy Success. transaction hash = ", transactionHash);
                        return;
                    }
                    console.log("Deploy Failure. Error code = ", error);
                }
            )
            .on('error', function(error) {
                console.error("Deploy Error: ", error);
            })
            .on('transactionHash', function(transactionHash) {
                console.log("transactionHash: ", transactionHash);
            })
            .on('receipt', function(receipt) {
               console.log("Receipt: ", receipt.contractAddress); // contains the new contract address
            })
            .on('confirmation', function(confirmationNumber, receipt) {
                console.log("Confirmation: ", confirmationNumber, receipt);
            })
            .then(function(newContractInstance) {
                console.log("New contract instance: ", newContractInstance.options.address); // instance with the new contract address
                process.exit(0);
            });    
        });
        
        rl._writeToOutput = function _writeToOutput(stringToWrite) {
            if (rl.stdoutMuted)
                rl.output.write("*");
            else
                rl.output.write(stringToWrite);
        };

                
    } catch (error) {
        console.error("Failed to create contract: ", error);
    }
}

async function readContractAbiAndBin(contractFileInfo) {
    try {
        var abiData = fs.readFileSync("./" + contractFileInfo.source.replace(".", "_") + '_' + contractFileInfo.contract + '.abi');
        contractFileInfo['abi'] = JSON.parse(abiData.toString());
        var binaryData = fs.readFileSync("./" + contractFileInfo.source.replace(".", "_") + '_' + contractFileInfo.contract + '.bin')
        contractFileInfo['bin'] = "0x" + binaryData.toString();
    } catch (err) {
        console.error(err)
    }
}

async function attachToGethIPC(ipcPath) {
    fs.access(ipcPath, (err) => {
        if (!err) {
            gethProvider = new Web3.providers.IpcProvider(ipcPath, net);
            web3 = new Web3(gethProvider);
            if (!web3) {
                return;
            }
            console.log("Attached to Geth IPC successfully");
            // clearTimeout(gethIpcTimer);
            // gethIpcTimer = null;
            compileContracts();
        }
    });
}

//var gethCmd = runExternalProgram('geth', ['--goerli', '--syncmode', 'light']);

// var gethIpcTimer = setTimeout(attachToGethIPC, 10000, ipcPath);
attachToGethIPC(ipcPath);