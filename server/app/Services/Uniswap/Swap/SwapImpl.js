const { ExchangeAbi, TokenAbi, ExchangeAddress, TokenAddress } = require("../Abi/Erc20Abi");
const EthereumTx = require('ethereumjs-tx').Transaction;

const DEFAULT_DEADLINE = 300; // 300s = 5min

async function sendSignedTx(web3, transactionObject, privateKeyString, onCompleteCallback, onFailedCallback) {
    try {
        const tx = new EthereumTx(transactionObject, { chain: 'goerli', hardfork: 'petersburg' });
        const privateKey = new Buffer.from(privateKeyString, "hex");
        tx.sign(privateKey);
        const serializedethTx = tx.serialize().toString("hex");
        var receipt = await web3.eth.sendSignedTransaction(`0x${serializedethTx}`);
        onCompleteCallback(0, receipt);
    } catch (error) {
        var errMsg = error ? 
            error.message ? 
                error.message.replace('Returned error: ', '') : 
                "Unknown error in send transaction for swap": 
            error;
        onFailedCallback(errMsg)
    }
}

async function ETH2Token(web3, params, onCompleteCallback, onFailedCallback) {
    const exchangeContract = new web3.eth.Contract(
        JSON.parse(ExchangeAbi), 
        ExchangeAddress[params.buySymbol]
    );
    let transactionNonce = await web3.eth.getTransactionCount(params.address);

    let ethToTokenSwapInputFunc = exchangeContract.methods
        .ethToTokenSwapInput(params.acceptableMinRate, params.deadline);
    if (!ethToTokenSwapInputFunc) {
        onFailedCallback("Failed to get abi for swap function");
        return;
    }
    const ethToTokenSwapInputABI = ethToTokenSwapInputFunc.encodeABI();
    const transactionObject = {
        chainId: params.chainId,
        nonce: web3.utils.toHex(transactionNonce),
        gasLimit: web3.utils.toHex(6000000),
        gasPrice: web3.utils.toHex(10000000000),
        from: params.address,
        to: ExchangeAddress[params.buySymbol],
        data: ethToTokenSwapInputABI,
        value: params.sellAmount
    };
    sendSignedTx(
        web3, 
        transactionObject, 
        params.privateKey.toString('hex'), 
        onCompleteCallback,
        onFailedCallback
    );
}

/**
 * params:
 *  {
 *      tokenContract: 
 *  }
 */
async function Token2ETH(web3, params) {
    // Exchange
    const tokenContract = new web3.eth.Contract(TokenAbi["DAI"], TokenAddress["DAI"]);
    const ADDRESS_SPENDER = ExchangeAddress["DAI"];
    const TOKENS = web3.utils.toHex(1 * 10 ** 18); // 1 DAI
    const approveABI = tokenContract.methods
        .approve(ADDRESS_SPENDER, TOKENS)
        .encodeABI();

    transactionNonce = await web3.eth.getTransactionCount(params.address)
    const transactionObject = {
        chainId: 4,
        nonce: web3.utils.toHex(transactionNonce),
        gasLimit: web3.utils.toHex(42000),
        gasPrice: web3.utils.toHex(5000000),
        to: TokenAddress[params.buySymbol],
        from: params.address,
        data: approveABI
    };
    sendSignedTx(transactionObject, params.privateKey, function (error, result) {
        if (error) return console.log("error ===>", error);
        console.log("sent ===>", result);
    })

    const TOKENS_SOLD = web3.utils.toHex(0.4 * 10 ** 18); // 0.4DAI
    const MIN_ETH = web3.utils.toHex(5000000000000000); // 0.005ETH
    const tokenToEthSwapInputABI = daiExchangeContract.methods
        .tokenToEthSwapInput(TOKENS_SOLD, MIN_ETH, params.deadline)
        .encodeABI();
}

module.exports = {
    ETH2Token,
    Token2ETH,
    DEFAULT_DEADLINE
}