const IERC20 = require('@uniswap/v2-periphery/build/IERC20.json')
const IPair = require('@uniswap/v2-core/build/IUniswapV2Pair.json')
const IFactory = require('@uniswap/v2-core/build/IUniswapV2Factory.json')
const IRouter = require('@uniswap/v2-periphery/build/IUniswapV2Router02.json')

const { Erc20TokenABI, UniswapV2Router02Address, GoerliTokenAddress } = require("../Abi/Erc20Abi");
const EthereumTx = require('ethereumjs-tx').Transaction;

const DEFAULT_DEADLINE = 300; // 300s = 5min
const SLIPPAGE_MAX = 3; // 3%

async function erc20BalanceOf(web3, address, symbol) {
    try {
        const tokenContract = new web3.eth.Contract(Erc20TokenABI, GoerliTokenAddress[symbol]);
        let balance = 0;
        balance = await tokenContract.methods.balanceOf(address).call();
        return { error: 0, data: balance };
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

async function swapEthForToken(web3, params) {
    try {
        const WETH_ADDRESS = GoerliTokenAddress['WETH'];
        const erc20TokenAddress = GoerliTokenAddress[params.buySymbol];
        const path = [WETH_ADDRESS, erc20TokenAddress];
        const uniRouter02 = new web3.eth.Contract(IRouter.abi, UniswapV2Router02Address)
        const sellAmount = web3.utils.toHex(params.sellAmount);

        const ret = await uniRouter02.methods.swapExactETHForTokens(
            0,
            path,
            params.sellAddress,
            params.deadline
        ).send({
            from: params.sellAddress,
            value: sellAmount
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

async function swapTokenForEth(web3, params) {
    try {
        const WETH_ADDRESS = GoerliTokenAddress['WETH'];
        const erc20TokenAddress = GoerliTokenAddress[params.sellSymbol];
        const path = [erc20TokenAddress, WETH_ADDRESS];
        const sellAmount = web3.utils.toHex(params.sellAmount);

        let ret = null;
        const tokenContract = new web3.eth.Contract(Erc20TokenABI, erc20TokenAddress)
        ret = await tokenContract.methods.approve(UniswapV2Router02Address, sellAmount)
        .send({
            from: params.sellAddress,
        });

        // const amountsOut = await uniRouter02.methods.getAmountsOut(sellAmount, path).send({
        //     from: params.sellAddress,
        //     value: sellAmount
        // });
        // const amountOutMin = amountsOut[1].mul(web3.utils.toBN(100 - SLIPPAGE_MAX)).div(web3.utils.toBN(100));

        const uniRouter02 = new web3.eth.Contract(IRouter.abi, UniswapV2Router02Address)
        ret = await uniRouter02.methods.swapExactTokensForETH(
            sellAmount, 0, //amountOutMin,
            path,
            params.sellAddress,
            params.deadline
        )
        .send({
            from: params.sellAddress,
        })
        console.log(`Transaction hash: ${ret.transactionHash}`);
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

async function swapTokenForToken(web3, params) {
    try {
        const sellTokenAddress = GoerliTokenAddress[params.sellSymbol];
        const buyTokenAddress = GoerliTokenAddress[params.buySymbol];
        const path = [sellTokenAddress, buyTokenAddress];
        const sellAmount = web3.utils.toHex(params.sellAmount);

        let ret = null;
        const tokenContract = new web3.eth.Contract(Erc20TokenABI, sellTokenAddress)
        ret = await tokenContract.methods.approve(UniswapV2Router02Address, sellAmount)
        .send({
            from: params.sellAddress,
        });

        // const amountsOut = await uniRouter02.methods.getAmountsOut(sellAmount, path).send({
        //     from: params.sellAddress,
        //     value: sellAmount
        // });
        // const amountOutMin = amountsOut[1].mul(web3.utils.toBN(100 - SLIPPAGE_MAX)).div(web3.utils.toBN(100));

        const uniRouter02 = new web3.eth.Contract(IRouter.abi, UniswapV2Router02Address); //, params.signer
        ret = await uniRouter02.methods.swapExactTokensForTokens(
            sellAmount,
            0, // amountOutMin,
            path,
            params.sellAddress,
            params.deadline
        ).send({
            from: params.sellAddress,
            value: sellAmount
        });
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
    swapEthForToken,
    swapTokenForEth,
    swapTokenForToken,
    DEFAULT_DEADLINE
}