const IRouter = require('@uniswap/v2-periphery/build/IUniswapV2Router02.json')
// const erc20 = require("@studydefi/money-legos/erc20")
// const uniswap = require("@studydefi/money-legos/uniswap")
const OpenchainContractAbi = require('../../../build/contracts/OcdSwap.json');
const PawnNFTsAbi = require('../../../build/contracts/PawnNFTs.json');
const openchainContractAbi = OpenchainContractAbi.abi;
const pawnNftAbi = PawnNFTsAbi.abi;

const { 
    Erc20TokenABI,
    UniswapV2Router02Address, 
    GOERLI_CONTRACTS,
    GANACHE_CONTRACTS,
    PawningContractAddress,
} = require("./Abi/Erc20Abi");

const EthereumTx = require('ethereumjs-tx').Transaction;

const DEFAULT_DEADLINE = 300;   // 300s = 5min
const SLIPPAGE_MAX = 3;         // 3%

class OpenchainTransactions {

    constructor(web3, myAddress) {
        this.web3 = web3;
        this.myAddress = myAddress;
    }

    async getBalance(symbol) {
        try {
            let tokenContractAddress = GOERLI_CONTRACTS[symbol];
            if (process.env.BLOCKCHAIN_EMULATOR === "ganache") {
                tokenContractAddress = GANACHE_CONTRACTS[symbol];
            }
            const tokenContract = new this.web3.eth.Contract(Erc20TokenABI, tokenContractAddress);
            let balanceInWei = await tokenContract.methods.balanceOf(this.myAddress).call();
            let decimals = await tokenContract.methods.decimals().call();
            let balance = balanceInWei / (10 ** (decimals - 0));
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
            let WETH_ADDRESS = GOERLI_CONTRACTS['WETH'];
            let sellTokenAddress = GOERLI_CONTRACTS[params.sellSymbol];
            let buyTokenAddress = GOERLI_CONTRACTS[params.buySymbol];

            if (process.env.BLOCKCHAIN_EMULATOR === "ganache") {
                WETH_ADDRESS = GANACHE_CONTRACTS['WETH'];
                sellTokenAddress = GANACHE_CONTRACTS[params.sellSymbol];
                buyTokenAddress = GANACHE_CONTRACTS[params.buySymbol];
            }

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
            let WETH_ADDRESS = GOERLI_CONTRACTS['WETH'];
            let erc20TokenAddress = GOERLI_CONTRACTS[params.buySymbol];
            let ourSwapContractAddress = GOERLI_CONTRACTS.OCD_SWAP;

            if (process.env.BLOCKCHAIN_EMULATOR === "ganache") {
                WETH_ADDRESS = GANACHE_CONTRACTS['WETH'];
                erc20TokenAddress = GANACHE_CONTRACTS[params.buySymbol];
                ourSwapContractAddress = GANACHE_CONTRACTS.OCD_SWAP;
            }
            const path = [WETH_ADDRESS, erc20TokenAddress];
            const openchainSwap = new this.web3.eth.Contract(openchainContractAbi, ourSwapContractAddress);
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
            let ourSwapContractAddress = GOERLI_CONTRACTS.OCD_SWAP;
            if (process.env.BLOCKCHAIN_EMULATOR === "ganache") {
                ourSwapContractAddress = GANACHE_CONTRACTS.OCD_SWAP;
            }
            const openchainSwap = new this.web3.eth.Contract(openchainContractAbi, ourSwapContractAddress);
            let erc20TokenAddress = GOERLI_CONTRACTS[params.sellSymbol];
            if (process.env.BLOCKCHAIN_EMULATOR === "ganache") {
                erc20TokenAddress = GANACHE_CONTRACTS[params.sellSymbol];
            }
            const sellAmountInHex = this.web3.utils.toHex(params.sellAmount);
            const buyAmountInHex = this.web3.utils.toHex(params.buyAmountMin);
            let ret = null;

            const tokenContract = new this.web3.eth.Contract(Erc20TokenABI, erc20TokenAddress);
            ret = await tokenContract.methods.approve(ourSwapContractAddress, sellAmountInHex)
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
            let ourSwapContractAddress = GOERLI_CONTRACTS.OCD_SWAP;
            if (process.env.BLOCKCHAIN_EMULATOR === "ganache") {
                ourSwapContractAddress = GANACHE_CONTRACTS.OCD_SWAP;
            }
            const openchainSwap = new this.web3.eth.Contract(openchainContractAbi, GOERLI_CONTRACTS.OCD_SWAP);
            let sellTokenAddress = GOERLI_CONTRACTS[params.sellSymbol];
            let buyTokenAddress = GOERLI_CONTRACTS[params.buySymbol];
            if (process.env.BLOCKCHAIN_EMULATOR === "ganache") {
                sellTokenAddress = GANACHE_CONTRACTS[params.sellSymbol];
                buyTokenAddress = GANACHE_CONTRACTS[params.buySymbol];
            }
            const path = [sellTokenAddress, buyTokenAddress];
            const sellAmountInHex = this.web3.utils.toHex(params.sellAmount);
            let ret = null;

            // const buyAmountMinInHex = this.web3.utils.toHex(params.buyAmountMin);
            const buyAmountMinInHex = this.web3.utils.toHex("0");

            const sellTokenContract = new this.web3.eth.Contract(Erc20TokenABI, sellTokenAddress);

            if (process.env.BLOCKCHAIN_EMULATOR === "ganache") {
                ourSwapContractAddress = GANACHE_CONTRACTS.OCD_SWAP;
            }
            ret = await sellTokenContract.methods.approve(ourSwapContractAddress, sellAmountInHex)
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

    async buildOpenchainLiquidity(params) {
        try {
            const uniRouter02 = new this.web3.eth.Contract(IRouter.abi, UniswapV2Router02Address)
            let ret = await uniRouter02.addLiquidityETH(
                GOERLI_CONTRACTS.OCAT, 
                web3.utils.toWei('1000'), 
                web3.utils.toWei('980'), 
                web3.utils.toWei('1'), 
                this.myAddress, 
                params.deadline,
                {
                    value: web3.utils.toWei('1')
                }
            );
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

    mintPawnNft = async params => {
        let owner = params ? params.owner ? params.owner : null : null;
        if (!owner) {
            return { error: -1, data: "Invalid owner" };
        }
        let assetId = params ? params.assetId ? params.assetId : null : null;
        if (!assetId) {
            return { error: -1, data: "Invalid asset id" };
        }
        let assetInfo = params ? params.assetInfo ? params.assetInfo : null : null;
        if (!assetInfo) {
            return { error: -2, data: "Invalid asset data" };
        }
        try {
            let pnftContractAddress = GOERLI_CONTRACTS.PNFT;
            if (process.env.BLOCKCHAIN_EMULATOR === "ganache") {
                pnftContractAddress = GANACHE_CONTRACTS.PNFT;
            }
            let pawnNftContract = new this.web3.eth.Contract(pawnNftAbi, pnftContractAddress);
            let priceInWei = this.web3.utils.toWei(assetInfo.quote_price, "ether");
            let ret = await pawnNftContract.methods.mintPawnNFT(
                assetInfo.asset_name, 
                assetId, 
                priceInWei
            ).send({
                from: this.myAddress,
                // gasLimit: "70000"
                gas: "500000" // on ganache
            })
            if (!ret) {
                return { error: -251, data: "Failed to mint pawning NFT" };
            }
            let newTokenId = ret.events ?
                                ret.events.Transfer ?
                                    ret.events.Transfer.returnValues ?
                                        ret.events.Transfer.returnValues.tokenId ?
                                            ret.events.Transfer.returnValues.tokenId
                                        : null
                                    : null
                                : null
                            : null;
            if (!newTokenId) {
                return { error: -252, data: "Invalid new token ID for pawning NFT" };
            }
            return { error: 0, data: newTokenId };

        } catch (error) {
            var errMsg = error ?
                error.message ?
                    error.message.replace('Returned error: ', '') :
                    "Unknown error in send transaction for swap" :
                error;
            return { error: -400, data: errMsg };
        }
    }

    swapToOcat = async params => {
        let owner = params ? params.owner ? params.owner : null : null;
        if (!owner) {
            return { error: -1, data: "Invalid owner" };
        }
        let assetInfo = params ? params.assetInfo ? params.assetInfo : null : null;
        if (!assetInfo) {
            return { error: -2, data: "Invalid pawning data" };
        }
        try {
            let pnftContractAddress = GOERLI_CONTRACTS.PNFT;
            let ourSwapContractAddress = GOERLI_CONTRACTS.OCD_SWAP;
            if (process.env.BLOCKCHAIN_EMULATOR === "ganache") {
                ourSwapContractAddress = GANACHE_CONTRACTS.OCD_SWAP;
                pnftContractAddress = GANACHE_CONTRACTS.PNFT;
            }
            let openchainSwap = new this.web3.eth.Contract(openchainContractAbi, ourSwapContractAddress);
            let ret = await openchainSwap.methods.swapToOCAT(
                assetInfo.nft_id
            ).send({
                from: this.myAddress,
                gas: "500000"
            })
            if (!ret) {
                return { error: -251, data: "Failed to mint pawning NFT" };
            }
            return { error: 0, data: ret };

        } catch (error) {
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
    OpenchainTransactions,
    DEFAULT_DEADLINE
}