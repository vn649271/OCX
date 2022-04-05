const IRouter = require('@uniswap/v2-periphery/build/IUniswapV2Router02.json')
// const erc20 = require("@studydefi/money-legos/erc20")
// const uniswap = require("@studydefi/money-legos/uniswap")

const Erc20_DeployedInfo = require('../../build/contracts/ERC20.json');
const OcxExchange_DeployedInfo = require('../../build/contracts/OcxExchange.json');
const OcxLocalPool_DeployedInfo = require('../../build/contracts/OcxLocalPool.json');
const Pnft_DeployedInfo = require('../../build/contracts/PawnNFTs.json');
const OcatToken_DeployedInfo = require('../../build/contracts/OcatToken.json');
const OcxPriceOracle_DeployedInfo = require('../../build/contracts/OcxPriceOracle.json');

const ocxSwapAbi = OcxExchange_DeployedInfo.abi;
const ocxLocalPoolAbi = OcxLocalPool_DeployedInfo.abi;
const pawnNftAbi = Pnft_DeployedInfo.abi;
const ocatAbi = OcatToken_DeployedInfo.abi;
const erc20Abi = Erc20_DeployedInfo.abi;

const { 
    UniswapV2Router02Address, 
    ContractAddressMap,
    ChainIDMap
    // MAINNET_CONTRACTS,
    // GOERLI_CONTRACTS,
    // GANACHE_CONTRACTS,
} = require("./Erc20Abi");

const DEFAULT_DEADLINE = 300;   // 300s = 5min
const SLIPPAGE_MAX = 3;         // 3%
var gOpenchainRouter = null;

var self;

class OpenchainRouter {

    constructor(web3, myAddress) {
        self = this;
        this.web3 = web3;
        this.myAddress = myAddress;
    }

    async setDeveloperAccount() {
        if (process.env.IPC_TYPE == "ganache") {
            let accounts = await this.web3.eth.personal.getAccounts();
            this.myAddress = accounts[1];
            console.log("*************** My Address: ", self.myAddress);
        }
    }

    async getBalance(symbol) {
        try {
            let chainType = process.env.IPC_TYPE;
            let chainName = process.env.CHAIN_NAME;
            let tokenContractAddress = ContractAddressMap[chainType][chainName][symbol];

            const tokenContract = new this.web3.eth.Contract(erc20Abi, tokenContractAddress);
            let balanceInWei = await tokenContract.methods.balanceOf(this.myAddress).call();
            let decimals = await tokenContract.methods.decimals().call();
            let balance = balanceInWei / (10 ** (decimals - 0));
            console.log("@@@ OpenchainRouter.getBalance(): ", balance);
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

    getContractAddress(ContractJson) {
        return ContractJson.networks[
            ChainIDMap[process.env.IPC_TYPE][process.env.CHAIN_NAME]
        ] ? ContractJson.networks[
            ChainIDMap[process.env.IPC_TYPE][process.env.CHAIN_NAME]
        ].address: null;
    }

    async getBestPrice(params) {
        if (params.sellSymbol === params.buySymbol) {
            return { error: -1, data: "Illegal operation. Selling token must be different than token to buy" };
        }
        try {
            let WETH_ADDRESS = GOERLI_CONTRACTS['WETH'];
            let sellTokenAddress = GOERLI_CONTRACTS[params.sellSymbol];
            let buyTokenAddress = GOERLI_CONTRACTS[params.buySymbol];
            let amountOutMin = 0;
            if (params.sellSymbol == 'OCAT' || params.buySymbol == 'OCAT') {
                if ((params.sellSymbol == 'OCAT' && params.buySymbol == 'ETH') ||
                    (params.sellSymbol == 'ETH' && params.buySymbol == 'OCAT')
                ) {
                    let path = [params.sellSymbol, params.buySymbol];
                    let ocxLocalPoolAddress = this.getContractAddress(OcxLocalPool_DeployedInfo);
                    const ocxLocalPool = new this.web3.eth.Contract(ocxLocalPoolAbi, ocxLocalPoolAddress);
                    const sellAmount = this.web3.utils.toHex(params.sellAmount);
                    let ret = await ocxLocalPool.methods.getAmountsOut(sellAmount, path).call();
                    if (!ret) {
                        return { error: -2, data: "Failed to get best price" }
                    }
                    // let amountsOut = ret.amountOut;
                    // amountOutMin = await this.web3.utils.fromWei(amountsOut, "ether");
                    amountOutMin = ret.amountOut * (100 - SLIPPAGE_MAX) / 100;
                        // .mul(this.web3.utils.toBN)
                        // .div(this.web3.utils.toBN(100))
                        // .toString();
                } else {

                }
            } else {
                let path = [];
                if (params.sellSymbol !== "ETH" && params.buySymbol !== "ETH") {
                    path = [sellTokenAddress, WETH_ADDRESS, buyTokenAddress];
                } else if (params.sellSymbol === "ETH" && params.buySymbol !== "ETH") {
                    path = [WETH_ADDRESS, buyTokenAddress];
                } else if (params.sellSymbol !== "ETH" && params.buySymbol === "ETH") {
                    path = [sellTokenAddress, WETH_ADDRESS];
                } else {
                    return { error: -3, data: "Illegal Swap Pair. Selling token must be different than token to buy" };
                }
                const sellAmount = this.web3.utils.toHex(params.sellAmount);

                const uniRouter02 = new this.web3.eth.Contract(IRouter.abi, UniswapV2Router02Address)
                const amountsOut = await uniRouter02.methods.getAmountsOut(sellAmount, path).call();
                amountOutMin = this.web3.utils.toBN(amountsOut[amountsOut.length - 1])
                    .mul(this.web3.utils.toBN(100 - SLIPPAGE_MAX))
                    .div(this.web3.utils.toBN(100))
                    .toString();
            }
            console.log("@@@ OpenchainRouter.getBestPrice(): ", amountOutMin);                
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
            let chainType = process.env.IPC_TYPE;
            let chainName = process.env.CHAIN_NAME;
            let erc20TokenAddress = ContractAddressMap[chainType][chainName][buySymbol];
            let ocxExchangeAddress = ContractAddressMap[chainType][chainName].OCX_EXCHANGE;

            const sellAmountInHex = this.web3.utils.toHex(params.sellAmount);
            const buyAmountInHex = this.web3.utils.toHex(params.buyAmountMin);
            let gasPrice = await this.web3.eth.getGasPrice();
            gasPrice = (gasPrice * 1.2).toFixed(0);
            if (params.buySymbol != "OCAT") {
                const openchainSwap = new this.web3.eth.Contract(ocxSwapAbi, ocxExchangeAddress);
    
                let ret = await openchainSwap.methods.swapFromETH(
                    erc20TokenAddress,
                    buyAmountInHex,
                    params.deadline
                ).send({
                    from: this.myAddress,
                    value: sellAmountInHex
                })
                console.log("@@@ OpenchainRouter.swapEthForToken(): ", ret);
                return { error: 0, data: ret };
            } else {
                let ocxLocalPoolAddress = this.getContractAddress(OcxLocalPool_DeployedInfo);
                const ocxLocalPool = new this.web3.eth.Contract(ocxLocalPoolAbi, ocxLocalPoolAddress);
                let ret = await ocxLocalPool.methods.swapEthToOcat(buyAmountInHex, this.myAddress, params.deadline)
                .send({
                    from: this.myAddress,
                    value: sellAmountInHex,
                    gas: "100000",
                    gasPrice: gasPrice
                });
        
                return { error: 0, data: ret };
            }
        } catch (error) {
            var errMsg = error ?
                error.message ?
                    error.message.replace('Returned error: ', '') :
                    "Unknown error in send transaction for swap" :
                error;
            if (error.data !== undefined && error.data)  {
                console.log(error.data);
            }
            return { error: -400, data: errMsg };
        }
    }

    async swapTokenForEth(params) {
        try {
            let chainType = process.env.IPC_TYPE;
            let chainName = process.env.CHAIN_NAME;
            let erc20TokenAddress = ContractAddressMap[chainType][chainName][params.sellSymbol];
            let ocxExchangeAddress = ContractAddressMap[chainType][chainName].OCX_EXCHANGE;

            const sellAmountInHex = this.web3.utils.toHex(params.sellAmount);
            const buyAmountInHex = this.web3.utils.toHex(params.buyAmountMin);
            let ret = null;

            const tokenContract = new this.web3.eth.Contract(erc20Abi, erc20TokenAddress);
            if (params.sellSymbol != "OCAT") {
                ret = await tokenContract.methods.approve(ocxExchangeAddress, sellAmountInHex)
                .send({
                    from: this.myAddress,
                });
                if (!ret) {
                    return { error: -250, data: "Failed to approve the ERC20 token for the contract" };
                }
                const openchainSwap = new this.web3.eth.Contract(ocxSwapAbi, ocxExchangeAddress);
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
                console.log("@@@ OpenchainRouter.swapTokenForEth(): ", ret);
                return { error: 0, data: ret };                
            } else {
                let ocxLocalPoolAddress = this.getContractAddress(OcxLocalPool_DeployedInfo);
                let ocatContractAddress = this.getContractAddress(OcatToken_DeployedInfo);

                const ocatContract = new this.web3.eth.Contract(ocatAbi, ocatContractAddress);
                let gasPrice = await this.web3.eth.getGasPrice();
                gasPrice = (gasPrice * 1.2).toFixed(0);
                ret = await ocatContract.methods.approve(
                    ocxLocalPoolAddress, 
                    sellAmountInHex
                ).send({
                    from: this.myAddress,
                    gas: "280000",
                    gasPrice: gasPrice
                });
                if (!ret) {
                    return { error: -250, data: "Failed to approve the ERC20 token for the contract" };
                }
                const ocxLocalPool = new this.web3.eth.Contract(ocxLocalPoolAbi, ocxLocalPoolAddress);

                ret = await ocxLocalPool.methods.swapOcatToEth(
                    sellAmountInHex, 
                    buyAmountInHex, 
                    this.myAddress, 
                    params.deadline
                ).send({
                    from: this.myAddress,
                    gas: "280000",
                    gasPrice: gasPrice
                });
        
                return { error: 0, data: ret };
            }
        }
        catch (error) {
            var errMsg = error ?
                error.message ?
                    error.message.replace('Returned error: ', '') :
                    "Unknown error in send transaction for swap" :
                error;
            console.log("swapTokenForEth(): ", error);
            return { error: -400, data: errMsg };
        }
    }

    async swapTokenForToken(params) {
        try {
            let ocxExchangeAddress = this.getContractAddress(OcxExchange_DeployedInfo);
            const openchainSwap = new this.web3.eth.Contract(
                OcxExchange_DeployedInfo.abi, 
                ocxExchangeAddress
            );

            let chainType = process.env.IPC_TYPE;
            let chainName = process.env.CHAIN_NAME;

            let sellTokenAddress = ContractAddressMap[chainType][chainName][params.sellSymbol];
            let buyTokenAddress = ContractAddressMap[chainType][chainName][params.buySymbol];

            const path = [sellTokenAddress, buyTokenAddress];
            const sellAmountInHex = this.web3.utils.toHex(params.sellAmount);

            // const buyAmountMinInHex = this.web3.utils.toHex(params.buyAmountMin);
            const buyAmountMinInHex = this.web3.utils.toHex("0");
            const sellTokenContract = new this.web3.eth.Contract(erc20Abi, sellTokenAddress);

            let ret = null;
            if (params.sellSymbol != "OCAT" && params.buySymbol != "OCAT") {
                ret = await sellTokenContract.methods.approve(ocxExchangeAddress, sellAmountInHex)
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
                console.log("@@@ OpenchainRouter.swapTokenForToken(): ", ret);
                return { error: 0, data: ret };
            } else {
                ret = await this.swapTokenForEth({
                    sellSymbol: params.sellSymbol,
                    buySymbol: "ETH",
                    buyAmountMin: 0,
                    deadline: params.deadline
                });
                if (!ret || ret.error != undefined) {
                    return {error: -250, data: "Failed to cross-swap(1)"}
                }
                if (ret.error != 0) {
                    return ret;
                }
                ret = await this.swapEthForToken({
                    sellSymbol: "ETH",
                    buySymbol: params.buySymbol,
                    buyAmountMin: params.buyAmountMin,
                    deadline: params.deadline
                });
                if (!ret || ret.error != undefined) {
                    return {error: -251, data: "Failed to cross-swap(2)"}
                }
                if (ret.error != 0) {
                    return ret;
                }
            }
        } catch (error) {
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
            console.log("@@@ OpenchainRouter.buildOpenchainLiquidity(): ", ret);
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
            let pnftContractAddress = this.getContractAddress(Pnft_DeployedInfo);
            let pawnNftContract = new this.web3.eth.Contract(Pnft_DeployedInfo.abi, pnftContractAddress);
            let priceInWei = this.web3.utils.toWei(assetInfo.estimated_ocat, "ether");
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
            console.log("@@@ OpenchainRouter.mintPawnNft(): ", newTokenId);
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

    exchangeToOcat = async params => {
        let owner = params ? params.owner ? params.owner : null : null;
        if (!owner) {
            return { error: -1, data: "Invalid owner" };
        }
        let assetInfo = params ? params.assetInfo ? params.assetInfo : null : null;
        if (!assetInfo) {
            return { error: -2, data: "Invalid pawning data" };
        }
        try {
            let pnftContractAddress = this.getContractAddress(Pnft_DeployedInfo);
            let ocxExchangeAddress = this.getContractAddress(OcxExchange_DeployedInfo);
            const pnftContract = new this.web3.eth.Contract(Pnft_DeployedInfo.abi, pnftContractAddress);
            if (assetInfo.nft_id === undefined) {
                return { error: -250, data: "Could not to find ID for the pawning NFT" };
            }
            let gasPrice = await this.web3.eth.getGasPrice();
            gasPrice = (gasPrice * 1.2).toFixed(0);
            let ret = await pnftContract.methods.approve(ocxExchangeAddress, assetInfo.nft_id)
                .send({
                    from: this.myAddress,
                    gas: "280000",
                    gasPrice: gasPrice
                });
            let openchainSwap = new this.web3.eth.Contract(ocxSwapAbi, ocxExchangeAddress);
            // Get latest value of gas limit
            gasPrice = (gasPrice * 1.2).toFixed(0);
            let latestBlock = await this.web3.eth.getBlock("latest");
            if (!latestBlock || !latestBlock.gasLimit) {
                return { error: -251, data: "Could not to get information of latest block" };
            }
            let gasLimit = latestBlock.gasLimit;
            gasLimit = (gasLimit * 1.5).toFixed(0);
            // Do exchange
            ret = await openchainSwap.methods.exchangeToOcat(
                assetInfo.nft_id
            ).send({
                from: this.myAddress,
                gas: "760000",
                gasPrice: gasPrice,
                gasLimit: gasLimit
            })
            if (!ret) {
                return { error: -252, data: "Failed to mint pawning NFT" };
            }
            console.log("@@@ OpenchainRouter.exchangeToOcat(): ", ret.transactionHash);
            return { error: 0, data: ret.transactionHash };

        } catch (error) {
            var errMsg = error ?
                error.message ?
                    error.message.replace('Returned error: ', '') :
                    "Unknown error in send transaction for swap" :
                error;
            return { error: -400, data: errMsg };
        }
    }

    exchangeFromOcat = async params => {
        let owner = params ? params.owner ? params.owner : null : null;
        if (!owner) {
            return { error: -1, data: "Invalid owner" };
        }
        let assetInfo = params ? params.assetInfo ? params.assetInfo : null : null;
        if (!assetInfo) {
            return { error: -2, data: "Invalid pawning data" };
        }
        try {
            let pnftContractAddress = this.getContractAddress(Pnft_DeployedInfo);
            let ocatContractAddress = this.getContractAddress(OcatToken_DeployedInfo);
            let ocxExchangeAddress = this.getContractAddress(OcxExchange_DeployedInfo);

            const pnftContract = new this.web3.eth.Contract(Pnft_DeployedInfo.abi, pnftContractAddress);
            let ret = await pnftContract.methods.allPawnNFTs(assetInfo.nft_id).call(); //().
            if (!ret || ret.price === undefined || !ret.price) {
                return { error: -250, data: "Failed to get OCAT for the pawning NFT" };
            }
            let priceInWei = ret.price;
            const ocatContract = new this.web3.eth.Contract(ocatAbi, ocatContractAddress);
            let gasPrice = await this.web3.eth.getGasPrice();
            gasPrice = (gasPrice * 1.2).toFixed(0);
            ret = await ocatContract.methods.approve(ocxExchangeAddress, priceInWei).//assetInfo.nft_id
                send({
                    from: this.myAddress,
                    gas: "280000",
                    gasPrice: gasPrice
                });
            let openchainSwap = new this.web3.eth.Contract(ocxSwapAbi, ocxExchangeAddress);
            gasPrice = (gasPrice * 1.2).toFixed(0);

            // Get latest value of gas limit
            let latestBlock = await this.web3.eth.getBlock("latest");
            if (!latestBlock || !latestBlock.gasLimit) {
                return { error: -251, data: "Could not to get information of latest block" };
            }
            let gasLimit = latestBlock.gasLimit;
            gasLimit = (gasLimit * 1.5).toFixed(0);
            
            // Do swap
            ret = await openchainSwap.methods.exchangeFromOcat(
                assetInfo.nft_id
            ).send({
                from: this.myAddress,
                gas: "780000",
                gasPrice: gasPrice
            })
            if (!ret) {
                return { error: -251, data: "Failed to mint pawning NFT" };
            }
            console.log("@@@ OpenchainRouter.exchangeFromOcat(): ", ret.transactionHash);
            return { error: 0, data: ret.transactionHash };

        } catch (error) {
            var errMsg = error ?
                error.message ?
                    error.message.replace('Returned error: ', '') :
                    "Unknown error in send transaction for swap" :
                error;
            return { error: -400, data: errMsg };
        }
    }

    getPriceList = async () => {
        const priceOracleContract = new this.web3.eth.Contract(
            OcxPriceOracle_DeployedInfo.abi, 
            this.getContractAddress(OcxPriceOracle_DeployedInfo)
        );

        try {
            // let gasPrice = await this.web3.eth.getGasPrice();
            // gasPrice = (gasPrice * 1.2).toFixed(0);
    
            let ret = await priceOracleContract.methods.getPrice("ETHUSD").send({
                from: this.myAddress,
                gas: "500000",
                // gasPrice: gasPrice
            });
            return ret;
        } catch (error) {
            return error;
        }
    }
}

async function openchainRouterInstance(web3, myAddress) {    
    if (!gOpenchainRouter) {
        gOpenchainRouter = new OpenchainRouter(web3, myAddress);
        await gOpenchainRouter.setDeveloperAccount();
    }
    return gOpenchainRouter;
}

module.exports = {
    OpenchainRouter,
    DEFAULT_DEADLINE,
    openchainRouterInstance,
}