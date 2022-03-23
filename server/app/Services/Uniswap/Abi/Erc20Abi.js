// Uniswap V3: https://docs.uniswap.org/protocol/concepts/governance/overview#uni-address
//      "UNI": "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
// https://goerli.etherscan.io/token/0x6be1a99c215872cea33217b0f4bad63f186ddfac
// Goerli DAI: https://goerli.etherscan.io/token/0x78ae714dc2ac1d00b33da9e392a9ee851ed48e5a

// https://docs.uniswap.org/protocol/V2/reference/smart-contracts/router-02#Address
const UniswapV2Router02Address = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

const GOERLI_CONTRACTS = {
    // Our Tokens
    PNFT: "0x799a47f4c992720e28052003E2A1061c58F932F6",
    OCAT: "0xE66BC32333bb10C4732442fAf6f51fd530119EE0", // "0x0b8dF9B22806E2042cc4d84D9835625F90e4d9ec";
    OCX_SWAP: "0x6880db8353038BBC894b0Fb0cB5CD873D20Af945",
    // https://docs.uniswap.org/protocol/reference/deployments
    WETH: "0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6",
    UNI: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984", //"0x6Be1a99C215872Cea33217B0f4bAd63f186ddFac", 0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984
    // https://explorer.bitquery.io/ru/goerli/token/0x5d3a895cbb0b04e2ee5348ac42fd7da24c1fb4f6
    DAI: "0xdc31ee1784292379fbb2964b3b9c4124d8f89c60" // 0x11fE4B6AE13d2a6055C8D9cF65c55bac32B5d844
}

const GANACHE_CONTRACTS = {
    // Our Tokens
    PNFT: "0x5E823193BC85d07C494c305fD61da539CC1de7F7",
    OCAT: "0xe7C4fB88Ee9B0838d31eE894F6259B8a79FBb506", // "0x0b8dF9B22806E2042cc4d84D9835625F90e4d9ec";
    OCX_SWAP: "0xF787aDA7622385655a5AE76Bd52eA2357684CF74",
    // WETH: "0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6",
    // UNI: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984", //"0x6Be1a99C215872Cea33217B0f4bAd63f186ddFac", 0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984
    // DAI: "0xdc31ee1784292379fbb2964b3b9c4124d8f89c60" // 0x11fE4B6AE13d2a6055C8D9cF65c55bac32B5d844
}

module.exports = {
    UniswapV2Router02Address,
    GOERLI_CONTRACTS,
    GANACHE_CONTRACTS,
};