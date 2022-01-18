const IERC20 = require('@uniswap/v2-periphery/build/IERC20.json')
const IPair = require('@uniswap/v2-core/build/IUniswapV2Pair.json')
const IFactory = require('@uniswap/v2-core/build/IUniswapV2Factory.json')
const IRouter = require('@uniswap/v2-periphery/build/IUniswapV2Router02.json')

const { ExchangeAbi, TokenAbi, UniswapV2Router02Address, GoerliTokenAddress } = require("../Abi/Erc20Abi");
const EthereumTx = require('ethereumjs-tx').Transaction;

const DEFAULT_DEADLINE = 300; // 300s = 5min

// async function sendSignedTx(web3, transactionObject, privateKeyString) {
//     try {
//         const tx = new EthereumTx(
//             transactionObject,
//             { chain: 'goerli', hardfork: 'petersburg' }
//         );
//         const privateKey = new Buffer.from(privateKeyString, "hex");
//         tx.sign(privateKey);
//         const serializedethTx = tx.serialize().toString("hex");
//         var receipt = await web3.eth.sendSignedTransaction(`0x${serializedethTx}`);
//         return { error: 0, data: receipt };
//     } catch (error) {
//         var errMsg = error ?
//             error.message ?
//                 error.message.replace('Returned error: ', '') :
//                 "Unknown error in send transaction for swap" :
//             error;
//         return { error: -200, data: errMsg };
//     }
// }
//
// async function getABI_EthToTokenSwapInput(web3, tokenSymbol, acceptableMinRate, deadline = DEFAULT_DEADLINE) {
//     try {
//         const exchangeContract = new web3.eth.Contract(
//             JSON.parse(ExchangeAbi),
//             UniswapV2Router02Address
//         );
//         if (!exchangeContract) {
//             return { error: -1, data: null };
//         }
//         let ethToTokenSwapInputFunc = await exchangeContract.methods
//             .ethToTokenSwapInput(acceptableMinRate, deadline);
//         if (!ethToTokenSwapInputFunc) {
//             return { error: -2, data: null };
//         }
//         let abi = ethToTokenSwapInputFunc.encodeABI();
//         if (!abi) {
//             return { error: -3, data: null };
//         }
//         return { error: 0, data: abi };
//     } catch (error) {
//         var errMsg = error ?
//             error.message ?
//                 error.message.replace('Returned error: ', '') :
//                 "Unknown error in send transaction for swap" :
//             error;
//         return { error: -210, data: errMsg };
//     }
// }

// function getExchangeContractAddress() {
//     return UniswapV2Router02Address;
// }

// async function ETH2Token(web3, params) {
//     try {
//         let { error, data } = await getABI_EthToTokenSwapInput(web3, params.buySymbol, params.acceptableMinRate, params.deadline.valueOf());
//         if (error < 0) {
//             return { error: -30 + error, data: data.message };
//         }
//         let transactionNonce = await web3.eth.getTransactionCount(params.sellAddress);
//         let ethToTokenSwapInputFuncAbi = data;
//         const transactionObject = {
//             // chainId: params.chainId,
//             nonce: web3.utils.toHex(transactionNonce),
//             gasLimit: web3.utils.toHex(6000000),
//             gasPrice: web3.utils.toHex(10000000000),
//             from: params.sellAddress,
//             to: UniswapV2Router02Address,
//             data: ethToTokenSwapInputFuncAbi,
//             value: web3.utils.toHex(params.sellAmount)
//         };
//         let ret = await sendSignedTx(
//             web3,
//             transactionObject,
//             params.privateKey.toString('hex')
//         );
//         if (ret.error < 0) {
//             return { error: -40 + ret.error, data: ret.data };
//         }
//         return { error: 0, data: ret.data };
//     } catch (error) {
//         var errMsg = error ?
//             error.message ?
//                 error.message.replace('Returned error: ', '') :
//                 "Unknown error in send transaction for swap" :
//             error;
//         return { error: -250, data: errMsg };
//     }
// }

async function erc20BalanceOf(web3, address, symbol) {
    try {
        const tokenContract = new web3.eth.Contract(IRouter.abi, GoerliTokenAddress[symbol])
        const ret = await tokenContract.methods.balanceOf(address)
        return { error: 0, data: ret };
    }
    catch (error) {
        var errMsg = error ?
            error.message ?
                error.message.replace('Returned error: ', '') :
                "Unknown error in send transaction for swap" :
            error;
        return { error: -200, data: errMsg };
    }
}

async function SwapEthForToken(web3, params) {
    try {
        const WETH_ADDRESS = GoerliTokenAddress['WETH'];
        const erc20TokenAddress = GoerliTokenAddress[params.buySymbol];
        const path = [WETH_ADDRESS, erc20TokenAddress];        
        const uniRouter02 = new web3.eth.Contract(IRouter.abi, UniswapV2Router02Address)
        const nowInSeconds = Math.floor(Date.now() / 1000)
        const expiryDate = nowInSeconds + 600; // 600s = 10min
        const ethAmount = web3.utils.toHex(params.sellAmount);

        const ret = await uniRouter02.methods.swapExactETHForTokens(
            0,
            path,
            params.sellAddress,
            expiryDate
        ).send({ 
            from: params.sellAddress, 
            value: ethAmount
        })
        return { error: 0, data: ret };
    }
    catch (error) {
        var errMsg = error ?
            error.message ?
                error.message.replace('Returned error: ', '') :
                "Unknown error in send transaction for swap" :
            error;
        return { error: -200, data: errMsg };
    }
}

module.exports = {
    erc20BalanceOf,
    SwapEthForToken,
    DEFAULT_DEADLINE
}