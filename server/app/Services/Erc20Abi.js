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
            WETH: "0x3a918E7944c9D78Cde1FE3d7253dacE482BDE3FA",
            DAI: "0x08c7EBd7B3eA84cD0cD31FFF6bfb806acE073981",
            UNI: "0x1A43390664D55d4848468169DbbCa7F2736be1b6",
            PNFT: "0x8D83850cAe9E1617248B9338D60D6166de11D0f3",
            OCAT: "0x7d0DD7D73511a10fE196656812bD9C9e49162e23",
            PAWN_EXCHANGE: "0x44cf226011eD773bD631Ca0b4466e5e56e4278d8",
            OCX_LOCAL_POOL: "0xDB1503B5efDf86a8f3D5492c820382F4F915bE92",
            OCX_PRICE_ORACLE: "0xA92730dDA4432Fb0E6F13f89237DB477C4Be6B2E",
            OCX_EXCHANGE: "0x5A31C369AAa5e43b45fa90E1a13a8FDdBA41b8bF"
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
        main: 5777,
        goerli: 5777
    }
}

module.exports = {
    UniswapV2Router02Address,
    ContractAddressMap,
    ChainIDMap
};