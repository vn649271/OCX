const addressFrom = "[YOUR_ADDRESS]";
const privKey = "[YOUR_PRIVATE_KEY]";
const web3 = new Web3(new Web3.providers.HttpProvider("https://rinkeby.infura.io/v3/[YOUR_PROJECT_ID]"));
const daiExchangeAddress = 0x77dB9C915809e7BE439D2AB21032B1b8B58F6891;
// const daiExchangeAddress = "0x77dB9C915809e7BE439D2AB21032B1b8B58F6891";
const daiTokenAddress = "0x2448eE2641d78CC42D7AD76498917359D961A783";

const daiExchangeAbi = [
    { "name": "TokenPurchase", "inputs": [{ "type": "address", "name": "buyer", "indexed": true }, { "type": "uint256", "name": "eth_sold", "indexed": true }, { "type": "uint256", "name": "tokens_bought", "indexed": true }], "anonymous": false, "type": "event" },
    { "name": "EthPurchase", "inputs": [{ "type": "address", "name": "buyer", "indexed": true }, { "type": "uint256", "name": "tokens_sold", "indexed": true }, { "type": "uint256", "name": "eth_bought", "indexed": true }], "anonymous": false, "type": "event" },
    { "name": "AddLiquidity", "inputs": [{ "type": "address", "name": "provider", "indexed": true }, { "type": "uint256", "name": "eth_amount", "indexed": true }, { "type": "uint256", "name": "token_amount", "indexed": true }], "anonymous": false, "type": "event" },
    { "name": "RemoveLiquidity", "inputs": [{ "type": "address", "name": "provider", "indexed": true }, { "type": "uint256", "name": "eth_amount", "indexed": true }, { "type": "uint256", "name": "token_amount", "indexed": true }], "anonymous": false, "type": "event" },
    { "name": "Transfer", "inputs": [{ "type": "address", "name": "_from", "indexed": true }, { "type": "address", "name": "_to", "indexed": true }, { "type": "uint256", "name": "_value", "indexed": false }], "anonymous": false, "type": "event" },
    { "name": "Approval", "inputs": [{ "type": "address", "name": "_owner", "indexed": true }, { "type": "address", "name": "_spender", "indexed": true }, { "type": "uint256", "name": "_value", "indexed": false }], "anonymous": false, "type": "event" }, { "name": "setup", "outputs": [], "inputs": [{ "type": "address", "name": "token_addr" }], "constant": false, "payable": false, "type": "function", "gas": 175875 },
    { "name": "addLiquidity", "outputs": [{ "type": "uint256", "name": "out" }], "inputs": [{ "type": "uint256", "name": "min_liquidity" }, { "type": "uint256", "name": "max_tokens" }, { "type": "uint256", "name": "deadline" }], "constant": false, "payable": true, "type": "function", "gas": 82605 },
    { "name": "removeLiquidity", "outputs": [{ "type": "uint256", "name": "out" }, { "type": "uint256", "name": "out" }], "inputs": [{ "type": "uint256", "name": "amount" }, { "type": "uint256", "name": "min_eth" }, { "type": "uint256", "name": "min_tokens" }, { "type": "uint256", "name": "deadline" }], "constant": false, "payable": false, "type": "function", "gas": 116814 },
    { "name": "__default__", "outputs": [], "inputs": [], "constant": false, "payable": true, "type": "function" },
    { "name": "ethToTokenSwapInput", "outputs": [{ "type": "uint256", "name": "out" }], "inputs": [{ "type": "uint256", "name": "min_tokens" }, { "type": "uint256", "name": "deadline" }], "constant": false, "payable": true, "type": "function", "gas": 12757 },
    { "name": "ethToTokenTransferInput", "outputs": [{ "type": "uint256", "name": "out" }], "inputs": [{ "type": "uint256", "name": "min_tokens" }, { "type": "uint256", "name": "deadline" }, { "type": "address", "name": "recipient" }], "constant": false, "payable": true, "type": "function", "gas": 12965 },
    { "name": "ethToTokenSwapOutput", "outputs": [{ "type": "uint256", "name": "out" }], "inputs": [{ "type": "uint256", "name": "tokens_bought" }, { "type": "uint256", "name": "deadline" }], "constant": false, "payable": true, "type": "function", "gas": 50463 },
    { "name": "ethToTokenTransferOutput", "outputs": [{ "type": "uint256", "name": "out" }], "inputs": [{ "type": "uint256", "name": "tokens_bought" }, { "type": "uint256", "name": "deadline" }, { "type": "address", "name": "recipient" }], "constant": false, "payable": true, "type": "function", "gas": 50671 },
    { "name": "tokenToEthSwapInput", "outputs": [{ "type": "uint256", "name": "out" }], "inputs": [{ "type": "uint256", "name": "tokens_sold" }, { "type": "uint256", "name": "min_eth" }, { "type": "uint256", "name": "deadline" }], "constant": false, "payable": false, "type": "function", "gas": 47503 },
    { "name": "tokenToEthTransferInput", "outputs": [{ "type": "uint256", "name": "out" }], "inputs": [{ "type": "uint256", "name": "tokens_sold" }, { "type": "uint256", "name": "min_eth" }, { "type": "uint256", "name": "deadline" }, { "type": "address", "name": "recipient" }], "constant": false, "payable": false, "type": "function", "gas": 47712 },
    { "name": "tokenToEthSwapOutput", "outputs": [{ "type": "uint256", "name": "out" }], "inputs": [{ "type": "uint256", "name": "eth_bought" }, { "type": "uint256", "name": "max_tokens" }, { "type": "uint256", "name": "deadline" }], "constant": false, "payable": false, "type": "function", "gas": 50175 },
    { "name": "tokenToEthTransferOutput", "outputs": [{ "type": "uint256", "name": "out" }], "inputs": [{ "type": "uint256", "name": "eth_bought" }, { "type": "uint256", "name": "max_tokens" }, { "type": "uint256", "name": "deadline" }, { "type": "address", "name": "recipient" }], "constant": false, "payable": false, "type": "function", "gas": 50384 },
    { "name": "tokenToTokenSwapInput", "outputs": [{ "type": "uint256", "name": "out" }], "inputs": [{ "type": "uint256", "name": "tokens_sold" }, { "type": "uint256", "name": "min_tokens_bought" }, { "type": "uint256", "name": "min_eth_bought" }, { "type": "uint256", "name": "deadline" }, { "type": "address", "name": "token_addr" }], "constant": false, "payable": false, "type": "function", "gas": 51007 },
    { "name": "tokenToTokenTransferInput", "outputs": [{ "type": "uint256", "name": "out" }], "inputs": [{ "type": "uint256", "name": "tokens_sold" }, { "type": "uint256", "name": "min_tokens_bought" }, { "type": "uint256", "name": "min_eth_bought" }, { "type": "uint256", "name": "deadline" }, { "type": "address", "name": "recipient" }, { "type": "address", "name": "token_addr" }], "constant": false, "payable": false, "type": "function", "gas": 51098 },
    { "name": "tokenToTokenSwapOutput", "outputs": [{ "type": "uint256", "name": "out" }], "inputs": [{ "type": "uint256", "name": "tokens_bought" }, { "type": "uint256", "name": "max_tokens_sold" }, { "type": "uint256", "name": "max_eth_sold" }, { "type": "uint256", "name": "deadline" }, { "type": "address", "name": "token_addr" }], "constant": false, "payable": false, "type": "function", "gas": 54928 },
    { "name": "tokenToTokenTransferOutput", "outputs": [{ "type": "uint256", "name": "out" }], "inputs": [{ "type": "uint256", "name": "tokens_bought" }, { "type": "uint256", "name": "max_tokens_sold" }, { "type": "uint256", "name": "max_eth_sold" }, { "type": "uint256", "name": "deadline" }, { "type": "address", "name": "recipient" }, { "type": "address", "name": "token_addr" }], "constant": false, "payable": false, "type": "function", "gas": 55019 },
    { "name": "tokenToExchangeSwapInput", "outputs": [{ "type": "uint256", "name": "out" }], "inputs": [{ "type": "uint256", "name": "tokens_sold" }, { "type": "uint256", "name": "min_tokens_bought" }, { "type": "uint256", "name": "min_eth_bought" }, { "type": "uint256", "name": "deadline" }, { "type": "address", "name": "exchange_addr" }], "constant": false, "payable": false, "type": "function", "gas": 49342 },
    { "name": "tokenToExchangeTransferInput", "outputs": [{ "type": "uint256", "name": "out" }], "inputs": [{ "type": "uint256", "name": "tokens_sold" }, { "type": "uint256", "name": "min_tokens_bought" }, { "type": "uint256", "name": "min_eth_bought" }, { "type": "uint256", "name": "deadline" }, { "type": "address", "name": "recipient" }, { "type": "address", "name": "exchange_addr" }], "constant": false, "payable": false, "type": "function", "gas": 49532 },
    { "name": "tokenToExchangeSwapOutput", "outputs": [{ "type": "uint256", "name": "out" }], "inputs": [{ "type": "uint256", "name": "tokens_bought" }, { "type": "uint256", "name": "max_tokens_sold" }, { "type": "uint256", "name": "max_eth_sold" }, { "type": "uint256", "name": "deadline" }, { "type": "address", "name": "exchange_addr" }], "constant": false, "payable": false, "type": "function", "gas": 53233 },
    { "name": "tokenToExchangeTransferOutput", "outputs": [{ "type": "uint256", "name": "out" }], "inputs": [{ "type": "uint256", "name": "tokens_bought" }, { "type": "uint256", "name": "max_tokens_sold" }, { "type": "uint256", "name": "max_eth_sold" }, { "type": "uint256", "name": "deadline" }, { "type": "address", "name": "recipient" }, { "type": "address", "name": "exchange_addr" }], "constant": false, "payable": false, "type": "function", "gas": 53423 },
    { "name": "getEthToTokenInputPrice", "outputs": [{ "type": "uint256", "name": "out" }], "inputs": [{ "type": "uint256", "name": "eth_sold" }], "constant": true, "payable": false, "type": "function", "gas": 5542 },
    { "name": "getEthToTokenOutputPrice", "outputs": [{ "type": "uint256", "name": "out" }], "inputs": [{ "type": "uint256", "name": "tokens_bought" }], "constant": true, "payable": false, "type": "function", "gas": 6872 },
    { "name": "getTokenToEthInputPrice", "outputs": [{ "type": "uint256", "name": "out" }], "inputs": [{ "type": "uint256", "name": "tokens_sold" }], "constant": true, "payable": false, "type": "function", "gas": 5637 },
    { "name": "getTokenToEthOutputPrice", "outputs": [{ "type": "uint256", "name": "out" }], "inputs": [{ "type": "uint256", "name": "eth_bought" }], "constant": true, "payable": false, "type": "function", "gas": 6897 },
    { "name": "tokenAddress", "outputs": [{ "type": "address", "name": "out" }], "inputs": [], "constant": true, "payable": false, "type": "function", "gas": 1413 },
    { "name": "factoryAddress", "outputs": [{ "type": "address", "name": "out" }], "inputs": [], "constant": true, "payable": false, "type": "function", "gas": 1443 },
    { "name": "balanceOf", "outputs": [{ "type": "uint256", "name": "out" }], "inputs": [{ "type": "address", "name": "_owner" }], "constant": true, "payable": false, "type": "function", "gas": 1645 },
    { "name": "transfer", "outputs": [{ "type": "bool", "name": "out" }], "inputs": [{ "type": "address", "name": "_to" }, { "type": "uint256", "name": "_value" }], "constant": false, "payable": false, "type": "function", "gas": 75034 },
    { "name": "transferFrom", "outputs": [{ "type": "bool", "name": "out" }], "inputs": [{ "type": "address", "name": "_from" }, { "type": "address", "name": "_to" }, { "type": "uint256", "name": "_value" }], "constant": false, "payable": false, "type": "function", "gas": 110907 },
    { "name": "approve", "outputs": [{ "type": "bool", "name": "out" }], "inputs": [{ "type": "address", "name": "_spender" }, { "type": "uint256", "name": "_value" }], "constant": false, "payable": false, "type": "function", "gas": 38769 },
    { "name": "allowance", "outputs": [{ "type": "uint256", "name": "out" }], "inputs": [{ "type": "address", "name": "_owner" }, { "type": "address", "name": "_spender" }], "constant": true, "payable": false, "type": "function", "gas": 1925 },
    { "name": "name", "outputs": [{ "type": "bytes32", "name": "out" }], "inputs": [], "constant": true, "payable": false, "type": "function", "gas": 1623 },
    { "name": "symbol", "outputs": [{ "type": "bytes32", "name": "out" }], "inputs": [], "constant": true, "payable": false, "type": "function", "gas": 1653 },
    { "name": "decimals", "outputs": [{ "type": "uint256", "name": "out" }], "inputs": [], "constant": true, "payable": false, "type": "function", "gas": 1683 },
    { "name": "totalSupply", "outputs": [{ "type": "uint256", "name": "out" }], "inputs": [], "constant": true, "payable": false, "type": "function", "gas": 1713 }
];
const daiTokenAbi = [
    { "name": "Transfer", "inputs": [{ "type": "address", "name": "_from", "indexed": true }, { "type": "address", "name": "_to", "indexed": true }, { "type": "uint256", "name": "_value", "indexed": false }], "anonymous": false, "type": "event" },
    { "name": "Approval", "inputs": [{ "type": "address", "name": "_owner", "indexed": true }, { "type": "address", "name": "_spender", "indexed": true }, { "type": "uint256", "name": "_value", "indexed": false }], "anonymous": false, "type": "event" },
    { "outputs": [], "inputs": [{ "type": "string", "name": "_name" }, { "type": "string", "name": "_symbol" }, { "type": "uint256", "name": "_decimals" }, { "type": "uint256", "name": "_supply" }], "constant": false, "payable": false, "type": "constructor" },
    { "name": "transfer", "outputs": [{ "type": "bool", "name": "out" }], "inputs": [{ "type": "address", "name": "_to" }, { "type": "uint256", "name": "_value" }], "constant": false, "payable": false, "type": "function", "gas": 74020 },
    { "name": "transferFrom", "outputs": [{ "type": "bool", "name": "out" }], "inputs": [{ "type": "address", "name": "_from" }, { "type": "address", "name": "_to" }, { "type": "uint256", "name": "_value" }], "constant": false, "payable": false, "type": "function", "gas": 110371 },
    { "name": "approve", "outputs": [{ "type": "bool", "name": "out" }], "inputs": [{ "type": "address", "name": "_spender" }, { "type": "uint256", "name": "_value" }], "constant": false, "payable": false, "type": "function", "gas": 37755 },
    { "name": "name", "outputs": [{ "type": "string", "name": "out" }], "inputs": [], "constant": true, "payable": false, "type": "function", "gas": 6402 },
    { "name": "symbol", "outputs": [{ "type": "string", "name": "out" }], "inputs": [], "constant": true, "payable": false, "type": "function", "gas": 6432 },
    { "name": "decimals", "outputs": [{ "type": "uint256", "name": "out" }], "inputs": [], "constant": true, "payable": false, "type": "function", "gas": 663 },
    { "name": "totalSupply", "outputs": [{ "type": "uint256", "name": "out" }], "inputs": [], "constant": true, "payable": false, "type": "function", "gas": 693 },
    { "name": "balanceOf", "outputs": [{ "type": "uint256", "name": "out" }], "inputs": [{ "type": "address", "name": "arg0" }], "constant": true, "payable": false, "type": "function", "gas": 877 },
    { "name": "allowance", "outputs": [{ "type": "uint256", "name": "out" }], "inputs": [{ "type": "address", "name": "arg0" }, { "type": "address", "name": "arg1" }], "constant": true, "payable": false, "type": "function", "gas": 1061 }
];

const ETH_SOLD = web3.utils.toHex(50000000000000000); // 0.05ETH
const MIN_TOKENS = web3.utils.toHex(0.2 * 10 ** 18); // 0.2 DAI
const DEADLINE = 1646233200; // 1/31/2022 @ 12:00am (UTC)
const daiExchangeContract = new web3.eth.Contract(daiExchangeAbi, daiExchangeAddress);

async function ETH2Token(params) {
    
    function sendSignedTx(transactionObject, cb) {
        let transaction = new EthTx(transactionObject);
        const privateKey = new Buffer.from(params.privateKey, "hex");
        transaction.sign(privateKey);
        const serializedEthTx = transaction.serialize().toString("hex");
        web3.eth.sendSignedTransaction(`0x${serializedEthTx}`, cb);
    }
    let transactionNonce = await web3.eth.getTransactionCount(params.addressFrom);

    const ethToTokenSwapInputABI = params.exchangeContractAddress.methods
        .ethToTokenSwapInput(MIN_TOKENS, DEADLINE)
        .encodeABI();
    const transactionObject = {
        chainId: 4, // Rinkeby
        nonce: web3.utils.toHex(transactionNonce),
        gasLimit: web3.utils.toHex(6000000),
        gasPrice: web3.utils.toHex(10000000000),
        from: params.addressFrom,
        to: params.addressTo,
        data: ethToTokenSwapInputABI,
        value: params.amount
    };
    sendSignedTx(transactionObject, function (error, result) {
        if (error) return console.log("error ===>", error);
        console.log("sent ===>", result);
    })
}

const daiTokenContract = new web3.eth.Contract(daiTokenAbi, daiTokenAddress);

async function Token2ETH(params) {
    // Exchange
    const ADDRESS_SPENDER = daiExchangeAddress;
    const TOKENS = web3.utils.toHex(1 * 10 ** 18); // 1 DAI
    const approveABI = daiTokenContract.methods
        .approve(ADDRESS_SPENDER, TOKENS)
        .encodeABI();

    transactionNonce = await web3.eth.getTransactionCount(addressFrom)
    const transactionObject = {
        chainId: 4,
        nonce: web3.utils.toHex(transactionNonce),
        gasLimit: web3.utils.toHex(42000),
        gasPrice: web3.utils.toHex(5000000),
        to: daiTokenAddress,
        from: addressFrom,
        data: approveABI
    };
    sendSignedTx(transactionObject, function (error, result) {
        if (error) return console.log("error ===>", error);
        console.log("sent ===>", result);
    })

    const TOKENS_SOLD = web3.utils.toHex(0.4 * 10 ** 18); // 0.4DAI
    const MIN_ETH = web3.utils.toHex(5000000000000000); // 0.005ETH
    const DEADLINE = 1646233200; // 1/31/2022 @ 12:00am (UTC)
    const tokenToEthSwapInputABI = daiExchangeContract.methods
        .tokenToEthSwapInput(TOKENS_SOLD, MIN_ETH, DEADLINE)
        .encodeABI();
}

export default {
    ETH2Token,
    Token2ETH
}