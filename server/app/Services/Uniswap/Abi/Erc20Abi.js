// https://docs.uniswap.org/protocol/reference/deployments
const Erc20TokenABI = [
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
]

// https://docs.uniswap.org/protocol/V2/reference/smart-contracts/router-02#Address
const UniswapV2Router02Address = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

const GOERLI_CONTRACTS = {
    // Our Tokens
    PNFT: "0xc03671bAec263994964461CCbC12E7536F76bC99",
    OCAT: "0x9B1871Eb8f264BA8DfA19918F3b4DB11fE2eF588", // "0x0b8dF9B22806E2042cc4d84D9835625F90e4d9ec";
    OCD_SWAP: "0x0675F02356e064B6389831414058BC1845634690",
    // https://docs.uniswap.org/protocol/reference/deployments
    WETH: "0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6",
    UNI: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984", //"0x6Be1a99C215872Cea33217B0f4bAd63f186ddFac", 0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984
    // https://explorer.bitquery.io/ru/goerli/token/0x5d3a895cbb0b04e2ee5348ac42fd7da24c1fb4f6
    DAI: "0xdc31ee1784292379fbb2964b3b9c4124d8f89c60" // 0x11fE4B6AE13d2a6055C8D9cF65c55bac32B5d844
}

const GANACHE_CONTRACTS = {
    // Our Tokens
    PNFT: "0x298C657E7cA17a8D7325E538B932D30a170b0a1f",
    OCAT: "0xE1385634b1D84a7cF449A9656b1b0167315593ca", // "0x0b8dF9B22806E2042cc4d84D9835625F90e4d9ec";
    OCD_SWAP: "0xE8f4f0e041293AAFE22f97BE8eE42c7491B8fFb2",
    // https://docs.uniswap.org/protocol/reference/deployments
    WETH: "0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6",
    UNI: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984", //"0x6Be1a99C215872Cea33217B0f4bAd63f186ddFac", 0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984
    // https://explorer.bitquery.io/ru/goerli/token/0x5d3a895cbb0b04e2ee5348ac42fd7da24c1fb4f6
    DAI: "0xdc31ee1784292379fbb2964b3b9c4124d8f89c60" // 0x11fE4B6AE13d2a6055C8D9cF65c55bac32B5d844
}

// const PawnExchangeAddress = "0x2a927527A7ae3e7D1eeb9b1A626aD0753322302D";
const PawningContractAddress = "0xf50D3e6AB3539D994b8D44bD3cfA8c4F8E61971E";

// Uniswap V3: https://docs.uniswap.org/protocol/concepts/governance/overview#uni-address
//      "UNI": "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
// https://goerli.etherscan.io/token/0x6be1a99c215872cea33217b0f4bad63f186ddfac
// Goerli DAI: https://goerli.etherscan.io/token/0x78ae714dc2ac1d00b33da9e392a9ee851ed48e5a
//

module.exports = {
    Erc20TokenABI,
    UniswapV2Router02Address,
    GOERLI_CONTRACTS,
    GANACHE_CONTRACTS,
};