const { ExchangeAbi, TokenAbi, ExchangeAddress, TokenAddress } = require("../Abi/Erc20Abi");

const DEFAULT_DEADLINE = 300; // 300s = 5min

function sendSignedTx(web3, transactionObject, privateKeyString, callbackFunc) {
    let transaction = new EthTx(transactionObject);
    const privateKey = new Buffer.from(privateKeyString, "hex");
    transaction.sign(privateKey);
    const serializedEthTx = transaction.serialize().toString("hex");
    web3.eth.sendSignedTransaction(`0x${serializedEthTx}`, callbackFunc);
}

async function ETH2Token(web3, params, callbackFunc) {
    const exchangeContract = new web3.eth.Contract(
        JSON.parse(ExchangeAbi), 
        ExchangeAddress[params.buySymbol]
    );
    let transactionNonce = await web3.eth.getTransactionCount(params.address);

    const ethToTokenSwapInputABI = exchangeContract.methods
        .ethToTokenSwapInput(params.acceptableMinRate, params.deadline)
        .encodeABI();
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
    sendSignedTx(transactionObject, params.privateKey, callbackFunc)
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