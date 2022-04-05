// Uniswap V3: https://docs.uniswap.org/protocol/concepts/governance/overview#uni-address
//      "UNI": "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
// https://goerli.etherscan.io/token/0x6be1a99c215872cea33217b0f4bad63f186ddfac
// Goerli DAI: https://goerli.etherscan.io/token/0x78ae714dc2ac1d00b33da9e392a9ee851ed48e5a

// https://docs.uniswap.org/protocol/V2/reference/smart-contracts/router-02#Address
const UniswapV2Router02Address = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

const ContractAddressMap = {
    "geth": {
        "main": {
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
        },
        "goerli": {
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
        },
    },
    "ganache": {
        "main": {
            WETH: "0x0adc50427099D36C686775073aD4e08AAe4f33D7",
            DAI: "0xF26837F57AE001f09843F643027833dd4A08d9F3",
            UNI: "0x6adF414c7D7838997FBF6357f52D4fC22D903030",
            PNFT: "0x71B93De8930D714Daa7eD6A42959Fc64CE3a98A2",
            OCAT: "0x9138f99228E71840825b4D20C7a650B9A2Cfb4BF",
            PAWN_EXCHANGE: "0xff85754a8F270808BfCCf4bbDa12f05b8cba13f4",
            OCX_LOCAL_POOL: "0xeB55C95589785063949ace1a7c2DD0073267a4C4",
            OCX_EXCHANGE: "0x81732a41737Bb999DE739d40CEfD139A19f2C735"
        }
    }
}

const ChainIDMap = {
    geth: {
        main: 1,
        goerli: 5
    },
    infura: {
        main: 1,
        goerli: 5
    },
    ganache: {
        main: 5777
    }
}

module.exports = {
    UniswapV2Router02Address,
    ContractAddressMap,
    ChainIDMap
};