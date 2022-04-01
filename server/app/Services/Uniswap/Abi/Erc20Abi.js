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
    OCX_EXCHANGE: "0x6880db8353038BBC894b0Fb0cB5CD873D20Af945",
    OCX_LOCAL_POOL: "",
    // https://docs.uniswap.org/protocol/reference/deployments
    WETH: "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
    UNI: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984", //"0x6Be1a99C215872Cea33217B0f4bAd63f186ddFac", 0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984
    // https://explorer.bitquery.io/ru/goerli/token/0x5d3a895cbb0b04e2ee5348ac42fd7da24c1fb4f6
    DAI: "0xdc31ee1784292379fbb2964b3b9c4124d8f89c60" // 0x11fE4B6AE13d2a6055C8D9cF65c55bac32B5d844
}

const GANACHE_CONTRACTS = {
    WETH: "0xB13C5B5f45E5a25D0042BcecB1cde5a1fB8660f1",
    DAI: "0x63BAf9546888743B573853DB1F52ecfC79a30Cc4",
    UNI: "0x8AAbA9ebe96f0DbdA838F6Ae2E085DE1F0B0Ff55",
    PNFT: "0x2c5355E162ad0D67f5B1918A605AD0124702E056",
    OCAT: "0xdD41808F57988FDb144f5EDddd792bBbb1310e61",
    PAWN_EXCHANGE: "0x4610eEA51DBcB437d01f952F778133C88025C332",
    OCX_LOCAL_POOL: "0x842F74fe7d09D55e3e90B1F2A61785eB74546D81",
    OCX_EXCHANGE: "0x6Adfa590DF3E8F256bA4E3f90b25a41b52CE33da"
}

module.exports = {
    UniswapV2Router02Address,
    GOERLI_CONTRACTS,
    GANACHE_CONTRACTS,
};