const IRouter = require('@uniswap/v2-periphery/build/IUniswapV2Router02.json')
// const erc20 = require("@studydefi/money-legos/erc20")
// const uniswap = require("@studydefi/money-legos/uniswap")

const Erc20_DeployedInfo = require('../../build/contracts/ERC20.json');
const Weth_DeployedInfo = require('../../build/contracts/WEthToken.json');
const Uni_DeployedInfo = require('../../build/contracts/GUniToken.json');
const Dai_DeployedInfo = require('../../build/contracts/GDaiToken.json');
const OcxExchange_DeployedInfo = require('../../build/contracts/OcxExchange.json');
const OcxLocalPool_DeployedInfo = require('../../build/contracts/OcxLocalPool.json');
const Pnft_DeployedInfo = require('../../build/contracts/PawnNFTs.json');
const PnftExchange_DeployedInfo = require('../../build/contracts/PawnExchange.json');
const OcatToken_DeployedInfo = require('../../build/contracts/OcatToken.json');
const OcxPriceOracle_DeployedInfo = require('../../build/contracts/OcxPriceOracle.json');
const OcxBalancer_DeployedInfo = require('../../build/contracts/OcxBalancer.json');
const axios = require("axios");

const TOKEN_CONTRACT_MAP = {
    WETH: "WETH", // Weth_DeployedInfo,
    DAI: "DAI", // Dai_DeployedInfo,
    UNI: "UNI", // Uni_DeployedInfo,
    OCAT: OcatToken_DeployedInfo,
    PNFT: Pnft_DeployedInfo
}

const UNLOCK_ACCOUNT_INTERVAL = process.env.UNLOCK_ACCOUNT_INTERVAL || 15000; // 15s

const ocXchangeAbi = OcxExchange_DeployedInfo.abi;
const pnftSwapAbi = PnftExchange_DeployedInfo.abi;
const ocxLocalPoolAbi = OcxLocalPool_DeployedInfo.abi;
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
const FEE_CHECKING_INTERVAL = 300000; // every 300s
const ETH_PRICE_CHECKING_INTERVAL = 30000; // every 90s

var gOpenchainRouter = null;

var self;

class OpenchainRouter {
    constructor(web3) {
        self = this;
        this.web3 = web3;
        this.pnftFeeData = null;
        this.isPnftFeeDataValid = false;
        this.ethAudPrice = 0;
        this.latestEthAudPriceTime = null;
        this.ethAudBasePrice = 0;
        this.ethAudBaseTime = null;

        this.uniAudPrice = 0;
        this.latestUniAudPriceTime = null;
        this.uniAudBasePrice = 0;
        this.uniAudBaseTime = null;
        
        setTimeout(this._getPnftTxFee, FEE_CHECKING_INTERVAL);
    }
    async _checkForBalancing() {
        // Watch ETH-AUD price and save on-chain
        axios.request({
            method: 'GET',
            url: 'https://api.coinbase.com/v2/prices/ETH-AUD/historic?period=hour',            
        }).then(async response => {
            let prices = response.data? 
                response.data.data? 
                    response.data.data.prices? 
                        response.data.data.prices: 
                    null: 
                null:
            null;
            self.ethAudPrice = prices[0].price;
            self.latestEthAudPriceTime = new Date(prices[0].time);
            if (self.ethAudBasePrice == 0) {
                self.ethAudBasePrice = self.ethAudPrice;
                self.ethAudBaseTime = self.latestEthAudPriceTime;
                return;
            }
            let delta = self.ethAudPrice / self.ethAudBasePrice;
            // if (delta < 0.95 || delta > 1.05) {
                try {
                    let priceOracleAddress = self.getContractAddress(
                        OcxPriceOracle_DeployedInfo
                    );
                    self._unlockAccount().then(ret => {
                        if (ret.error) {
                            return ret;
                        }
                        const priceOracleContract = new self.web3.eth.Contract(
                            OcxPriceOracle_DeployedInfo.abi, 
                            priceOracleAddress
                        );
                        let ethAudPrice = Math.round((self.ethAudPrice - 0) * 1000000);
                        priceOracleContract.methods.setCurrencyRatio("ETH", "AUD", ethAudPrice)
                        .send({
                            from: self.myAddress
                        }).then(ret => {
                            if (ret.error != undefined && ret.error) {
                                console.log("Error occurred in save ETH/AUD: ", ret.data);
                                return;
                            }
                            let delta = self.ethAudPrice / self.ethAudBasePrice;
                            if (delta < 0.9 || delta > 1.1) {
                                // Run OcxBalancer
                                self._launchBalancer();
                            }
                        });
                    });
                } catch (error) {
                    console.log("********** Failed to save ETH-AUD price: ", error);
                }
            // }
        }).catch(error => {
            console.error(error);
        });
        // Watch UNI-AUD price and run balancer if needed
        axios.request({
            method: 'GET',
            url: 'https://api.coinbase.com/v2/prices/UNI-AUD/historic?period=hour',            
        }).then(async response => {
            let prices = response.data? 
                response.data.data? 
                    response.data.data.prices? 
                        response.data.data.prices: 
                    null: 
                null:
            null;
            self.uniAudPrice = prices[0].price;
            self.latestUniAudPriceTime = new Date(prices[0].time);
            if (self.uniAudBasePrice == 0) {
                self.uniAudBasePrice = self.uniAudPrice;
                self.uniAudBaseTime = self.latestUniAudPriceTime;
                return;
            }
            let delta = self.uniAudPrice / self.uniAudBasePrice;
            // if (delta < 0.95 || delta > 1.05) {
                try {
                    let priceOracleAddress = self.getContractAddress(
                        OcxPriceOracle_DeployedInfo
                    );
                    self._unlockAccount().then(ret => {
                        if (ret.error) {
                            return ret;
                        }
                        const priceOracleContract = new self.web3.eth.Contract(
                            OcxPriceOracle_DeployedInfo.abi, 
                            priceOracleAddress
                        );
                        let uniAudPrice = Math.round((self.uniAudPrice - 0) * 1000000);
                        priceOracleContract.methods.setCurrencyRatio("UNI", "AUD", uniAudPrice)
                        .send({ from: self.myAddress }).then(ret => {
                            if (ret.error != undefined && ret.error) {
                                console.log("Error occurred in save UNI/AUD: ", ret.data);
                                return;
                            }
                            let delta = self.uniAudPrice / self.uniAudBasePrice;
                            if (delta < 0.9 || delta > 1.1) {
                                // Run OcxBalancer
                                self._launchBalancer();
                            }
                        });
                    });
                } catch (error) {
                    console.log("********** Failed to save UNI-AUD price: ", error);
                }
            // }
        });
    }
    /**
     * Trigger OcxBalancer
     */ 
    _launchBalancer() {
        try {
            let balancerAddress = self.getContractAddress(OcxBalancer_DeployedInfo);
            const balancerContract = new self.web3.eth.Contract(
                OcxBalancer_DeployedInfo.abi, 
                balancerAddress
            );
            balancerContract.methods.run().send({
                from: self.myAddress
            });
        } catch (error) {
            console.log("Failed to run on-chain balancer: ", error);
        }
    }
    defaultErrorHanlder(errorObj) {
        if (errorObj.message == 'Invalid JSON RPC response: ""') {
            return 'It seem to be caused an error in access to blockchain';
        }
        if (typeof errorObj == 'object') {
            return errorObj.message ? errorObj.message.replace('Returned error: ', '') :
                "Unknown error in send transaction for swap";
        } else {
            return errorObj.toString();
        }
    }
    setAccountInfo(accountInfo) {
        var addresses = accountInfo.addresses;
        if (addresses['ETH'] === undefined || addresses['ETH'] === null) {
            return -1;
        }
        this.myAddress = addresses['ETH'];
        this.accountInfo = accountInfo;
        // Start stable coin system
        setInterval(this._checkForBalancing, ETH_PRICE_CHECKING_INTERVAL);
        this._checkForBalancing();
        return 0;
    }
    async setDeveloperAccount() {
        let accounts = await this.web3.eth.personal.getAccounts();
        this.myAddress = accounts[1];
        console.log("*************** My Address: ", self.myAddress);
    }
    async _unlockAccount() {
        try {
            if (process.env.IPC_TYPE != "ganache" && process.env.IPC_TYPE != 'infura') {
                ret = await this.web3.eth.personal.unlockAccount(
                    this.accountInfo.addresses['ETH'], 
                    this.accountInfo.account_password, 
                    UNLOCK_ACCOUNT_INTERVAL
                );
                if (!ret) {
                    return { error: -250, data: "Failed to unlock for your account" };
                }
                if (ret.error) {
                    return { error: -251, data: ret.message? ret.message : "Unknown error in unlocking your raccount" };
                }
                return { error: 0, data: ret };
            }
            return { error: 0, data: null };
        } catch(error) {
            return { error: -1300, data: error.message ? error.message: "Unexpected error for unlocking account"}
        }
    }
    getContractAddress(contractDeployedInfo) {
        let ipcType = process.env.IPC_TYPE;
        if (ipcType == undefined) {
            ipcType = 'geth';
        }
        if (contractDeployedInfo == "WETH" ||
        contractDeployedInfo == "UNI" ||
        contractDeployedInfo == "DAI") {
            if (ipcType == 'geth' || ipcType == 'infura' || ipcType == 'selfnode') {
                // For WETH, DAI and UNI,  brought built-in address 
                return ContractAddressMap[ipcType][process.env.CHAIN_NAME][contractDeployedInfo];
            }
        }
        return contractDeployedInfo.networks[
            ChainIDMap[process.env.IPC_TYPE][process.env.CHAIN_NAME]
        ] ? contractDeployedInfo.networks[
            ChainIDMap[process.env.IPC_TYPE][process.env.CHAIN_NAME]
        ].address: null;
    }
    async getBalance(symbol) {
        try {
            let tokenContractAddress = this.getContractAddress(TOKEN_CONTRACT_MAP[symbol]);
            const tokenContract = new this.web3.eth.Contract(erc20Abi, tokenContractAddress);
            let balanceInWei = await tokenContract.methods.balanceOf(this.myAddress).call();
            let decimals = await tokenContract.methods.decimals().call();
            let balance = balanceInWei / (10 ** (decimals - 0));
            console.log("@@@ OpenchainRouter.getBalance(): ", balance);
            return { error: 0, data: balance };
        }
        catch (error) {
            var errMsg = this.defaultErrorHanlder(error);
            return { error: -400, data: errMsg };
        }
    }
    async getBestPrice(params) {
        if (params.sellSymbol === params.buySymbol) {
            return { error: -1, data: "Illegal operation. Selling token must be different than token to buy" };
        }
        let ret = await this._unlockAccount();
        if (ret.error) {
            return ret;
        }
        try {
            let WETH_ADDRESS = this.getContractAddress(TOKEN_CONTRACT_MAP['WETH']);
            let sellTokenAddress = this.getContractAddress(TOKEN_CONTRACT_MAP[params.sellSymbol]);
            let buyTokenAddress = this.getContractAddress(TOKEN_CONTRACT_MAP[params.buySymbol]);

            let amountOutMin = 0;
            if (params.sellSymbol == 'OCAT' || params.buySymbol == 'OCAT') {
                if ((params.sellSymbol == 'OCAT' && params.buySymbol == 'ETH') ||
                    (params.sellSymbol == 'ETH' && params.buySymbol == 'OCAT')
                ) {
                    let path = [params.sellSymbol, params.buySymbol];
                    let ocxExchangeAddress = this.getContractAddress(OcxExchange_DeployedInfo);
                    const ocXchange = new this.web3.eth.Contract(ocXchangeAbi, ocxExchangeAddress);
                    const sellAmount = this.web3.utils.toHex(params.sellAmount);
                    ret = await ocXchange.methods.getAmountsOut(sellAmount, path).call();
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
            console.log("@@@ OpenchainRouter.`(): ", amountOutMin);                
            return { error: 0, data: amountOutMin };
        } catch (error) {
            var errMsg = this.defaultErrorHanlder(error);
            return { error: -400, data: errMsg };
        }
    }
    // async swapEthForToken(params) {
    //     let ret = await this._unlockAccount();
    //     if (ret.error) {
    //         return ret;
    //     }
    //     try {
    //         let erc20TokenAddress = this.getContractAddress(TOKEN_CONTRACT_MAP[params.buySymbol]);
    //         let ocxExchangeAddress = this.getContractAddress(OcxExchange_DeployedInfo);

    //         const sellAmountInHex = this.web3.utils.toHex(params.sellAmount);
    //         const buyAmountInHex = this.web3.utils.toHex(params.buyAmountMin);
    //         let gasPrice = await this.web3.eth.getGasPrice();
    //         gasPrice = (gasPrice * 1.2).toFixed(0);
    //         if (params.buySymbol != "OCAT") {
    //             const ocXchange = new this.web3.eth.Contract(ocXchangeAbi, ocxExchangeAddress);
    
    //             let ret = await ocXchange.methods.swapFromETH(
    //                 erc20TokenAddress,
    //                 buyAmountInHex,
    //                 params.deadline
    //             ).send({
    //                 from: this.myAddress,
    //                 value: sellAmountInHex
    //             })
    //             console.log("@@@ OpenchainRouter.swapEthForToken(): ", ret);
    //             return { error: 0, data: ret };
    //         } else {
    //             let ocxLocalPoolAddress = this.getContractAddress(OcxLocalPool_DeployedInfo);
    //             const ocxLocalPool = new this.web3.eth.Contract(ocxLocalPoolAbi, ocxLocalPoolAddress);
    //             let ret = await ocxLocalPool.methods.swapEthToOcat(buyAmountInHex, this.myAddress, params.deadline)
    //             .send({
    //                 from: this.myAddress,
    //                 value: sellAmountInHex,
    //                 gas: "100000",
    //                 gasPrice: gasPrice
    //             });
        
    //             return { error: 0, data: ret };
    //         }
    //     } catch (error) {
    //         var errMsg = this.defaultErrorHanlder(error);
    //         return { error: -400, data: errMsg };
    //     }
    // }

    // async swapTokenForEth(params) {
    //     let ret = await this._unlockAccount();
    //     if (ret.error) {
    //         return ret;
    //     }
    //     try {
    //         let erc20TokenAddress = this.getContractAddress(TOKEN_CONTRACT_MAP[params.sellSymbol]);
    //         let ocxExchangeAddress = this.getContractAddress(OcxExchange_DeployedInfo);

    //         const sellAmountInHex = this.web3.utils.toHex(params.sellAmount);
    //         const buyAmountInHex = this.web3.utils.toHex(params.buyAmountMin);
    //         let ret = null;

    //         const tokenContract = new this.web3.eth.Contract(erc20Abi, erc20TokenAddress);
    //         if (params.sellSymbol != "OCAT") {
    //             ret = await tokenContract.methods.approve(ocxExchangeAddress, sellAmountInHex)
    //             .send({
    //                 from: this.myAddress,
    //             });
    //             if (!ret) {
    //                 return { error: -250, data: "Failed to approve the ERC20 token for the contract" };
    //             }
    //             const ocXchange = new this.web3.eth.Contract(ocXchangeAbi, ocxExchangeAddress);
    //             ret = await ocXchange.methods.swapToETH(
    //                 erc20TokenAddress,
    //                 sellAmountInHex,
    //                 buyAmountInHex,
    //                 params.deadline
    //             ).send({
    //                 from: this.myAddress
    //             })
    //             if (!ret) {
    //                 return { error: -251, data: "Failed to swap from ERC20 token to ETH" };
    //             }
    //             console.log("@@@ OpenchainRouter.swapTokenForEth(): ", ret);
    //             return { error: 0, data: ret };                
    //         } else {
    //             let ocxLocalPoolAddress = this.getContractAddress(OcxLocalPool_DeployedInfo);
    //             let ocatContractAddress = this.getContractAddress(OcatToken_DeployedInfo);

    //             const ocatContract = new this.web3.eth.Contract(ocatAbi, ocatContractAddress);
    //             let gasPrice = await this.web3.eth.getGasPrice();
    //             gasPrice = (gasPrice * 1.2).toFixed(0);
    //             ret = await ocatContract.methods.approve(
    //                 ocxLocalPoolAddress, 
    //                 sellAmountInHex
    //             ).send({
    //                 from: this.myAddress,
    //                 gas: "280000",
    //                 gasPrice: gasPrice
    //             });
    //             if (!ret) {
    //                 return { error: -250, data: "Failed to approve the ERC20 token for the contract" };
    //             }
    //             const ocxLocalPool = new this.web3.eth.Contract(ocxLocalPoolAbi, ocxLocalPoolAddress);

    //             ret = await ocxLocalPool.methods.swapOcatToEth(
    //                 sellAmountInHex, 
    //                 buyAmountInHex, 
    //                 this.myAddress, 
    //                 params.deadline
    //             ).send({
    //                 from: this.myAddress,
    //                 gas: "280000",
    //                 gasPrice: gasPrice
    //             });
        
    //             return { error: 0, data: ret };
    //         }
    //     }
    //     catch (error) {
    //         var errMsg = this.defaultErrorHanlder(error);
    //         return { error: -400, data: errMsg };
    //     }
    // }
    async swap(params) {
        let ret = await this._unlockAccount();
        if (ret.error) {
            return ret;
        }
        try {
            let ocxExchangeAddress = this.getContractAddress(OcxExchange_DeployedInfo);
            const ocXchange = new this.web3.eth.Contract(
                OcxExchange_DeployedInfo.abi, 
                ocxExchangeAddress
            );

            let sellTokenAddress = this.getContractAddress(TOKEN_CONTRACT_MAP[params.sellSymbol]);
            let buyTokenAddress = this.getContractAddress(TOKEN_CONTRACT_MAP[params.buySymbol]);

            const path = [sellTokenAddress, buyTokenAddress];
            const sellAmountInHex = this.web3.utils.toHex(params.sellAmount);

            // const buyAmountMinInHex = this.web3.utils.toHex(params.buyAmountMin);
            const buyAmountMinInHex = this.web3.utils.toHex("0");
            const sellTokenContract = new this.web3.eth.Contract(erc20Abi, sellTokenAddress);

            let ret = await sellTokenContract.methods.approve(ocxExchangeAddress, sellAmountInHex)
            .send({
                from: this.myAddress,
            });
            if (!ret) {
                return { error: -250, data: "Failed to approve the ERC20 token for the contract" };
            }
            ret = await ocXchange.methods.swap(
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
        } catch (error) {
            var errMsg = this.defaultErrorHanlder(error);
            return { error: -400, data: errMsg };
        }
    }
    async buildOpenchainLiquidity(params) {
        let ret = await this._unlockAccount();
        if (ret.error) {
            return ret;
        }
        try {
            const uniRouter02 = new this.web3.eth.Contract(IRouter.abi, UniswapV2Router02Address)
            let ret = await uniRouter02.addLiquidityETH(
                GOERLI_CONTRACTS.OCAT, 
                this.web3.utils.toWei('1000'), 
                this.web3.utils.toWei('980'), 
                this.web3.utils.toWei('1'), 
                this.myAddress, 
                params.deadline,
                {
                    value: this.web3.utils.toWei('1')
                }
            );
            if (!ret) {
                return { error: -251, data: "Failed to swap from ERC20 token to ETH" };
            }
            console.log("@@@ OpenchainRouter.buildOpenchainLiquidity(): ", ret);
            return { error: 0, data: ret };
        }
        catch (error) {
            var errMsg = this.defaultErrorHanlder(error);
            return { error: -400, data: errMsg };
        }
    }
    mintPNFT = async params => {
        let owner = this.myAddress;
        let assetId = params ? params.assetId ? params.assetId : null : null;
        if (!assetId) {
            return { error: -2, data: "Invalid asset id" };
        }
        let assetInfo = params ? params.assetInfo ? params.assetInfo : null : null;
        if (!assetInfo) {
            return { error: -3, data: "Invalid asset data" };
        }
        let ret = await this._unlockAccount();
        if (ret.error) {
            return ret;
        }
        try {
            let pnftContractAddress = this.getContractAddress(Pnft_DeployedInfo);
            let pawnNftContract = new this.web3.eth.Contract(Pnft_DeployedInfo.abi, pnftContractAddress);
            // let priceInWei = this.web3.utils.toWei(assetInfo.estimated_ocat, "ether");
            let gasPrice = await this.web3.eth.getGasPrice();
            gasPrice = (gasPrice * 1.2).toFixed(0);
            let ret = await pawnNftContract.methods.mint(
                assetInfo.asset_name, 
                assetId, 
                assetInfo.quoted_price
            ).send({
                from: this.myAddress,
                // gasLimit: "70000"
                gas: "500000", // on ganache
                gasPrice: gasPrice
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
            console.log("@@@ OpenchainRouter.mintPNFT(): ", newTokenId);
            return { error: 0, data: newTokenId };
        } catch (error) {
            var errMsg = this.defaultErrorHanlder(error);
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
        let ret = await this._unlockAccount();
        if (ret.error) {
            return ret;
        }
        try {
            let pnftContractAddress = this.getContractAddress(Pnft_DeployedInfo);
            let pnftExchangeAddress = this.getContractAddress(PnftExchange_DeployedInfo);
            
            const pnftContract = new this.web3.eth.Contract(Pnft_DeployedInfo.abi, pnftContractAddress);
            if (assetInfo.nft_id === undefined) {
                return { error: -250, data: "Could not to find ID for the pawning NFT" };
            }
            let gasPrice = await this.web3.eth.getGasPrice();
            gasPrice = (gasPrice * 1.2).toFixed(0);
            let ret = await pnftContract.methods.approve(pnftExchangeAddress, assetInfo.nft_id)
                .send({
                    from: this.myAddress,
                    gas: "280000",
                    gasPrice: gasPrice
                });
            let pnftExchange = new this.web3.eth.Contract(pnftSwapAbi, pnftExchangeAddress);
            // Get latest value of gas limit
            gasPrice = (gasPrice * 1.2).toFixed(0);
            let latestBlock = await this.web3.eth.getBlock("latest");
            if (!latestBlock || !latestBlock.gasLimit) {
                return { error: -251, data: "Could not to get information of latest block" };
            }
            let gasLimit = latestBlock.gasLimit;
            gasLimit = (gasLimit * 1.5).toFixed(0);
            // Do exchange
            ret = await pnftExchange.methods.exchangeToOcat(
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
            var errMsg = this.defaultErrorHanlder(error);
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
        let ret = await this._unlockAccount();
        if (ret.error) {
            return ret;
        }
        try {
            let pnftContractAddress = this.getContractAddress(Pnft_DeployedInfo);
            let ocatContractAddress = this.getContractAddress(OcatToken_DeployedInfo);
            let pnftExchangeAddress = this.getContractAddress(PnftExchange_DeployedInfo);

            const pnftContract = new this.web3.eth.Contract(Pnft_DeployedInfo.abi, pnftContractAddress);
            let ret = await pnftContract.methods.allPawnNFTs(assetInfo.nft_id).call(); //().
            if (!ret || ret.price === undefined || !ret.price) {
                return { error: -250, data: "Failed to get OCAT for the pawning NFT" };
            }
            let priceInWei = ret.price;
            const ocatContract = new this.web3.eth.Contract(ocatAbi, ocatContractAddress);
            let gasPrice = await this.web3.eth.getGasPrice();
            gasPrice = (gasPrice * 1.2).toFixed(0);
            ret = await ocatContract.methods.approve(pnftExchangeAddress, priceInWei).//assetInfo.nft_id
                send({
                    from: this.myAddress,
                    gas: "280000",
                    gasPrice: gasPrice
                });
            let pnftExchange = new this.web3.eth.Contract(pnftSwapAbi, pnftExchangeAddress);
            gasPrice = (gasPrice * 1.2).toFixed(0);

            // Get latest value of gas limit
            let latestBlock = await this.web3.eth.getBlock("latest");
            if (!latestBlock || !latestBlock.gasLimit) {
                return { error: -251, data: "Could not to get information of latest block" };
            }
            let gasLimit = latestBlock.gasLimit;
            gasLimit = (gasLimit * 1.5).toFixed(0);

            // Do swap
            ret = await pnftExchange.methods.exchangeFromOcat(
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
            var errMsg = this.defaultErrorHanlder(error);
            return { error: -400, data: errMsg };
        }
    }
    getTokenPrices = async() => {
        try {
            let opoAddress = this.getContractAddress(OcxPriceOracle_DeployedInfo);
            const priceOracleContract = new this.web3.eth.Contract(
                OcxPriceOracle_DeployedInfo.abi, 
                opoAddress
            );
            let ethPrice = 3400000000; // await priceOracleContract.methods.getEthUsdPrice().call();
            ethPrice = ethPrice / (10 ** 6);
            let ocatPriceData = await priceOracleContract.methods.getOcatPrice().call();
            return {error: 0, data: {
                eth: ethPrice, 
                ocat: ocatPriceData.value / (10 ** (ocatPriceData.decimals - 0)), 
            }};
        } catch (error) {
            var errMsg = this.defaultErrorHanlder(error);
            return { error: -1300, data: errMsg };
        }
    }
    getSubmitFee = async () => {
        // Load values of fee for submition
        let opoAddress = this.getContractAddress(OcxPriceOracle_DeployedInfo);
        const priceOracleContract = new this.web3.eth.Contract(
            OcxPriceOracle_DeployedInfo.abi, 
            opoAddress
        );
        let submitFeeData = await priceOracleContract.methods.getSubmitFee().call();
        return {
            error: 0,
            data: {
                application: submitFeeData.application,
                valuation: submitFeeData.valuation
            }
        }
    }
    getWeeklyFee = async (basePrice) => {
        if (basePrice == undefined) {
            basePrice = 0;
        }
        if (basePrice < 0) {
            return {
                error: -1,
                data: "Invalid base price"
            }
        }
        let opoAddress = this.getContractAddress(OcxPriceOracle_DeployedInfo);
        const priceOracleContract = new this.web3.eth.Contract(
            OcxPriceOracle_DeployedInfo.abi, 
            opoAddress
        );
        try {
            let weeklyFeeData = await priceOracleContract.methods.getWeeklyFee(basePrice.toString()).call();
            return {
                error: 0,
                data: weeklyFeeData.value / Math.pow(10, weeklyFeeData.feeDecimals)
            }
        } catch(error) {
            var errMsg = this.defaultErrorHanlder(error);
            return { error: -1300, data: errMsg }
        }
    }
    _getPnftTxFee = async () => {
        this.isPnftFeeDataValid = false;
        let opoAddress = this.getContractAddress(OcxPriceOracle_DeployedInfo);
        const priceOracleContract = new this.web3.eth.Contract(
            OcxPriceOracle_DeployedInfo.abi, 
            opoAddress
        );
        try {
            let pnftFeeData = await priceOracleContract.methods.getPnftFee().call();
            if (pnftFeeData.error) {
                console.log("OcxRouter._getPnftTxFee(): Failed to get PNFT fee data");
                return;
            }
            this.isPnftFeeDataValid = true;
            this.pnftFeeData = {
                mint: pnftFeeData.mintFee / (10 ** (pnftFeeData.feeDecimals - 0)),
                loan: pnftFeeData.loanFee / (10 ** (pnftFeeData.feeDecimals - 0)),
                restore: pnftFeeData.restoreFee / (10 ** (pnftFeeData.feeDecimals - 0)),
            }
        } catch(error) {
            var errMsg = this.defaultErrorHanlder(error);
            console.log("OcxRouter._getPnftTxFee(): Failed to get PNFT fee data", error);
        }
    }
    getPnftTxFee = async () => {
        if (this.isPnftFeeDataValid) {
            return {error: 0, data: this.pnftFeeData};
        }
        let opoAddress = this.getContractAddress(OcxPriceOracle_DeployedInfo);
        const priceOracleContract = new this.web3.eth.Contract(
            OcxPriceOracle_DeployedInfo.abi, 
            opoAddress
        );
        try {
            let pnftFeeData = await priceOracleContract.methods.getPnftFeePercentages().call();
            if (!pnftFeeData) {
                return {error: -1001, data: "Failed to get PNFT related fee data"}
            }
            return {
                error: 0,
                data: {
                    mint: pnftFeeData.mintFee / (10 ** (pnftFeeData.feeDecimals - 0)),
                    loan: pnftFeeData.loanFee / (10 ** (pnftFeeData.feeDecimals - 0)),
                    restore: pnftFeeData.restoreFee / (10 ** (pnftFeeData.feeDecimals - 0)),
                }
            }
        } catch(error) {
            var errMsg = this.defaultErrorHanlder(error);
            return { error: -1300, data: errMsg }
        }
    }
}

async function openchainRouterInstance(web3, accountInfo) {    
    if (!gOpenchainRouter) {
        gOpenchainRouter = new OpenchainRouter(web3);
        let ret = gOpenchainRouter.setAccountInfo(accountInfo);
        if (ret != 0) {
            return null;
        }
        if (process.env.IPC_TYPE == "ganache") {
            await gOpenchainRouter.setDeveloperAccount();
        }
    }
    return gOpenchainRouter;
}

module.exports = {
    OpenchainRouter,
    DEFAULT_DEADLINE,
    openchainRouterInstance,
}
