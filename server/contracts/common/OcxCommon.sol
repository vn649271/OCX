// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

enum FeeType {
    PNFT_MINT_FEE,
    PNFT_OCAT_SWAP_FEE,
    OCAT_PNFT_SWAP_FEE,
    FEE_TYPE_SIZE
}

enum CommonContracts {
    WETH, OCAT, OCX, PNFT, UNI, DAI, PRICE_ORACLE, EXCHANGE, BALANCER, CONRACT_COUNT
}

enum CurrencyIndex {
    ETH, OCAT, OCX, USD, AUD, UNI, DAI, CURRENCY_COUNT
}

struct OcxPrice {
    uint256     value;
    uint8       decimals;
}

struct CurrencyPriceInfo {
    mapping(CurrencyIndex => OcxPrice)  vs;
}

// v2
// address constant UNISWAP_V3_ROUTER_ADDRESS = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
// v3
address constant UNISWAP_V3_ROUTER_ADDRESS = 0xE592427A0AEce92De3Edee1F18E0157C05861564;
address constant UNISWAP_V3_QUOTER_ADDRESS = 0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6;

uint24  constant POOL_FEE = 3000;
uint8   constant QUOTE_DECIMALS = 6; // Must be more than 3 at least
uint256 constant QUOTE_MULTIPLIER = 10 ** QUOTE_DECIMALS;

