const IERC20 = require('@uniswap/v2-periphery/build/IERC20.json')
const IPair = require('@uniswap/v2-core/build/IUniswapV2Pair.json')
const IFactory = require('@uniswap/v2-core/build/IUniswapV2Factory.json')
const IRouter = require('@uniswap/v2-periphery/build/IUniswapV2Router02.json')
// const erc20 = require("@studydefi/money-legos/erc20")
// const uniswap = require("@studydefi/money-legos/uniswap")

const { 
    Erc20TokenABI, 
    OpenchainContractAbi, 
    UniswapV2Router02Address, 
    GoerliTokenAddress 
} = require("../Abi/Erc20Abi");
const EthereumTx = require('ethereumjs-tx').Transaction;

const DEFAULT_DEADLINE = 300;   // 300s = 5min
const SLIPPAGE_MAX = 3;         // 3%

class ERC20TokenTransact {

    constructor(web3, myAddress) {
        this.web3 = web3;
        this.myAddress = myAddress;
    }

    async getBalance(symbol) {
        try {
            const tokenContract = new this.web3.eth.Contract(Erc20TokenABI, GoerliTokenAddress[symbol]);
            let balance = 0;
            balance = await tokenContract.methods.balanceOf(this.myAddress).call();
            return { error: 0, data: balance };
        }
        catch (error) {
            var errMsg = error ?
                error.message ?
                    error.message.replace('Returned error: ', '') :
                    "Unknown error in send transaction for swap" :
                error;
            return { error: -400, data: errMsg };
        }
    }

    async swapEthForToken(params) {
        try {
            const WETH_ADDRESS = GoerliTokenAddress['WETH'];
            const erc20TokenAddress = GoerliTokenAddress[params.buySymbol];
            const path = [WETH_ADDRESS, erc20TokenAddress];
            // const uniRouter02 = new this.web3.eth.Contract(IRouter.abi, UniswapV2Router02Address)
            const uniRouter02 = new this.web3.eth.Contract(OpenchainContractAbi, OpenchainContractAddress)
            const sellAmount = this.web3.utils.toHex(params.sellAmount);

            // const ret = await uniRouter02.methods.swapExactETHForTokens(
            //     0,
            //     path,
            //     this.myAddress,
            //     params.deadline
            // ).send({
            //     from: this.myAddress,
            //     value: sellAmount
            // })
            const ret = await uniRouter02.methods.swap(
                WETH_ADDRESS,
                params.sellAmount,
                erc20TokenAddress,
                0,
                this.myAddress,
                params.deadline
            ).send({
                from: this.myAddress,
                // value: sellAmount
            })
            return { error: 0, data: ret };
        }
        catch (error) {
            var errMsg = error ?
                error.message ?
                    error.message.replace('Returned error: ', '') :
                    "Unknown error in send transaction for swap" :
                error;
            return { error: -400, data: errMsg };
        }
    }

    async getBestPrice(params) {
        if (params.sellSymbol === params.buySymbol) {
            return { error: -1, data: "Illegal operation. Selling token must be different than token to buy" };
        }
        try {
            const WETH_ADDRESS = GoerliTokenAddress['WETH'];
            let erc20TokenAddress = GoerliTokenAddress[params.sellSymbol];
            let path = [erc20TokenAddress, WETH_ADDRESS];
            if (params.sellSymbol === "ETH" && params.buySymbol !== "ETH") {
                erc20TokenAddress = GoerliTokenAddress[params.buySymbol];
                path = [WETH_ADDRESS, erc20TokenAddress];
            }
            const sellAmount = this.web3.utils.toHex(params.sellAmount);

            const uniRouter02 = new this.web3.eth.Contract(IRouter.abi, UniswapV2Router02Address)
            const amountsOut = await uniRouter02.methods.getAmountsOut(sellAmount, path).call();
            const amountOutMin = this.web3.utils.toBN(amountsOut[1])
                .mul(this.web3.utils.toBN(100 - SLIPPAGE_MAX))
                .div(this.web3.utils.toBN(100))
                .toString();
            return { error: 0, data: amountOutMin };
        }
        catch (error) {
            var errMsg = error ?
                error.message ?
                    error.message.replace('Returned error: ', '') :
                    "Unknown error in send transaction for swap" :
                error;
            return { error: -400, data: errMsg };
        }
    }

    async swapTokenForEth(params) {
        try {
            const WETH_ADDRESS = GoerliTokenAddress['WETH'];
            const erc20TokenAddress = GoerliTokenAddress[params.sellSymbol];
            const path = [erc20TokenAddress, WETH_ADDRESS];
            const sellAmount = this.web3.utils.toHex(params.sellAmount);
            let ret = null;

            const uniRouter02 = new this.web3.eth.Contract(IRouter.abi, UniswapV2Router02Address)

            const amountsOut = await uniRouter02.methods.getAmountsOut(sellAmount, path).call();
            const amountOutMin = this.web3.utils.toBN(amountsOut[1])
                .mul(this.web3.utils.toBN(100 - SLIPPAGE_MAX))
                .div(this.web3.utils.toBN(100))
                .toString();
            const minBuyAmount = this.web3.utils.toHex(amountOutMin);

            const tokenContract = new this.web3.eth.Contract(Erc20TokenABI, erc20TokenAddress)
            ret = await tokenContract.methods.approve(UniswapV2Router02Address, sellAmount)
                .send({
                    from: this.myAddress,
                });

            ret = await uniRouter02.methods.swapExactTokensForETH(
                sellAmount, minBuyAmount,
                path,
                this.myAddress,
                params.deadline
            )
                .send({
                    from: this.myAddress,
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
            return { error: -400, data: errMsg };
        }
    }

    async swapTokenForToken(params) {
        try {
            const sellTokenAddress = GoerliTokenAddress[params.sellSymbol];
            const buyTokenAddress = GoerliTokenAddress[params.buySymbol];
            const path = [sellTokenAddress, buyTokenAddress];
            const sellAmount = this.web3.utils.toHex(params.sellAmount);
            let ret = null;
            const uniRouter02 = new this.web3.eth.Contract(IRouter.abi, UniswapV2Router02Address); //, params.signer

            const amountsOut = await uniRouter02.methods.getAmountsOut(sellAmount, path).call();
            const amountOutMin = this.web3.utils.toBN(amountsOut[1])
                .mul(this.web3.utils.toBN(100 - SLIPPAGE_MAX))
                .div(this.web3.utils.toBN(100))
                .toString();
            const minBuyAmount = this.web3.utils.toHex(amountOutMin);

            const tokenContract = new this.web3.eth.Contract(Erc20TokenABI, sellTokenAddress)
            ret = await tokenContract.methods.approve(UniswapV2Router02Address, sellAmount)
                .send({
                    from: this.myAddress,
                });

            ret = await uniRouter02.methods.swapExactTokensForTokens(
                sellAmount,
                minBuyAmount,
                path,
                this.myAddress,
                params.deadline
            ).send({
                from: this.myAddress,
            });
            return { error: 0, data: ret };
        }
        catch (error) {
            var errMsg = error ?
                error.message ?
                    error.message.replace('Returned error: ', '') :
                    "Unknown error in send transaction for swap" :
                error;
            return { error: -400, data: errMsg };
        }
    }
}

module.exports = {
    ERC20TokenTransact,
    DEFAULT_DEADLINE
}