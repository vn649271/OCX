// Uniswap V3: https://docs.uniswap.org/protocol/concepts/governance/overview#uni-address
//      "UNI": "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
// https://goerli.etherscan.io/token/0x6be1a99c215872cea33217b0f4bad63f186ddfac
// Goerli DAI: https://goerli.etherscan.io/token/0x78ae714dc2ac1d00b33da9e392a9ee851ed48e5a

// https://docs.uniswap.org/protocol/V2/reference/smart-contracts/router-02#Address
const UniswapV2Router02Address = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

const ContractAddressMap = {
    "geth": {
        "main": {
            // https://docs.uniswap.org/protocol/reference/deployments
            WETH: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            UNI: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
            DAI: "0x6b175474e89094c44da98b954eedeac495271d0f"
        },
        "goerli": {
            // https://docs.uniswap.org/protocol/reference/deployments
            WETH: "0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6",
            UNI: "0x5DBCF1aBC4a28940bcBE601f762CB6F2281e53FA", // GUNI for experiment
            // UNI: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
            DAI: "0xdc31ee1784292379fbb2964b3b9c4124d8f89c60"
        },
    },
    "ganache": {
        "main": {
            WETH: "0x3a918E7944c9D78Cde1FE3d7253dacE482BDE3FA",
            DAI: "0x08c7EBd7B3eA84cD0cD31FFF6bfb806acE073981",
            UNI: "0x1A43390664D55d4848468169DbbCa7F2736be1b6",
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