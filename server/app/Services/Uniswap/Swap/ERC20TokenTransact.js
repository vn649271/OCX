const IRouter = require('@uniswap/v2-periphery/build/IUniswapV2Router02.json')
// const erc20 = require("@studydefi/money-legos/erc20")
// const uniswap = require("@studydefi/money-legos/uniswap")
const OpenchainContractAbi = require('../../../../build/contracts/OpenchainContract.json');
const openchainContractAbi = OpenchainContractAbi.abi;

const { 
    Erc20TokenABI,
    OpenchainContractAddress,
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

    async getBestPrice(params) {
        if (params.sellSymbol === params.buySymbol) {
            return { error: -1, data: "Illegal operation. Selling token must be different than token to buy" };
        }
        try {
            const WETH_ADDRESS = GoerliTokenAddress['WETH'];
            let sellTokenAddress = GoerliTokenAddress[params.sellSymbol];
            let buyTokenAddress = GoerliTokenAddress[params.buySymbol];
            let path = [];
            if (params.sellSymbol !== "ETH" && params.buySymbol !== "ETH") {
                path = [sellTokenAddress, WETH_ADDRESS, buyTokenAddress];
            } else if (params.sellSymbol === "ETH" && params.buySymbol !== "ETH") {
                path = [WETH_ADDRESS, buyTokenAddress];
            } else if (params.sellSymbol !== "ETH" && params.buySymbol === "ETH") {
                path = [sellTokenAddress, WETH_ADDRESS];
            } else {
                return { error: -2, data: "Illegal Swap Pair. Selling token must be different than token to buy" };
            }
            const sellAmount = this.web3.utils.toHex(params.sellAmount);

            const uniRouter02 = new this.web3.eth.Contract(IRouter.abi, UniswapV2Router02Address)
            const amountsOut = await uniRouter02.methods.getAmountsOut(sellAmount, path).call();
            const amountOutMin = this.web3.utils.toBN(amountsOut[amountsOut.length - 1])
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

    async swapEthForToken(params) {
        try {
            const WETH_ADDRESS = GoerliTokenAddress['WETH'];
            const erc20TokenAddress = GoerliTokenAddress[params.buySymbol];
            const path = [WETH_ADDRESS, erc20TokenAddress];
            // const uniRouter02 = new this.web3.eth.Contract(IRouter.abi, UniswapV2Router02Address)
            const openchainSwap = new this.web3.eth.Contract(openchainContractAbi, OpenchainContractAddress);
            const sellAmountInHex = this.web3.utils.toHex(params.sellAmount);
            const buyAmountInHex = this.web3.utils.toHex(params.buyAmountMin);

            let ret = await openchainSwap.methods.swapFromETH(
                erc20TokenAddress,
                buyAmountInHex,
                params.deadline
            ).send({
                from: this.myAddress,
                value: sellAmountInHex
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

    async swapTokenForEth(params) {
        try {
            const openchainSwap = new this.web3.eth.Contract(openchainContractAbi, OpenchainContractAddress);
            const erc20TokenAddress = GoerliTokenAddress[params.sellSymbol];
            const sellAmountInHex = this.web3.utils.toHex(params.sellAmount);
            const buyAmountInHex = this.web3.utils.toHex(params.buyAmountMin);
            let ret = null;

            const tokenContract = new this.web3.eth.Contract(Erc20TokenABI, erc20TokenAddress);
            ret = await tokenContract.methods.approve(OpenchainContractAddress, sellAmountInHex)
                .send({
                    from: this.myAddress,
                });
            if (!ret) {
                return { error: -250, data: "Failed to approve the ERC20 token for the contract" };
            }
            ret = await openchainSwap.methods.swapToETH(
                erc20TokenAddress,
                sellAmountInHex,
                buyAmountInHex,
                params.deadline
            ).send({
                from: this.myAddress
            })
            if (!ret) {
                return { error: -251, data: "Failed to swap from ERC20 token to ETH" };
            }
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
            const openchainSwap = new this.web3.eth.Contract(openchainContractAbi, OpenchainContractAddress);
            const sellTokenAddress = GoerliTokenAddress[params.sellSymbol];
            const buyTokenAddress = GoerliTokenAddress[params.buySymbol];
            const path = [sellTokenAddress, buyTokenAddress];
            const sellAmountInHex = this.web3.utils.toHex(params.sellAmount);
            let ret = null;

            // const buyAmountMinInHex = this.web3.utils.toHex(params.buyAmountMin);
            const buyAmountMinInHex = this.web3.utils.toHex("0");

            const sellTokenContract = new this.web3.eth.Contract(Erc20TokenABI, sellTokenAddress)

            ret = await sellTokenContract.methods.approve(OpenchainContractAddress, sellAmountInHex)
                .send({
                    from: this.myAddress,
                });
            if (!ret) {
                return { error: -250, data: "Failed to approve the ERC20 token for the contract" };
            }
            ret = await openchainSwap.methods.swapForERC20(
                sellTokenAddress,
                sellAmountInHex,
                buyTokenAddress,
                buyAmountMinInHex,
                params.deadline
            ).send({
                from: this.myAddress
            })
            if (!ret) {
                return { error: -251, data: "Failed to swap from ERC20 token to ETH" };
            }
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