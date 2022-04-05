//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract OcxPriceOracle_Chainlink {

    AggregatorV3Interface internal priceFeed;

    WitnetPriceRouter = 0x1cF3Aa9DBF4880d797945726B94B9d29164211BE;

    mapping(string => address) public symbolPairList;

    /*
     * Supported symbol pair:
     *      AUDUSD:
     *      USDAUD:
     *      ETHUSD:
     *      UNIUSD:
     *      DAIUSD:
     *      ETHUNI:
     *      ETHDAI:
     *      ETHAUD:
     *      UNIAUD:
     *      DAIAUD:
     */
    constructor() {
        symbolPairList['ETHUSD'] = 0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419;
    }

    function getPrice(string memory symbolPair) public returns (int) {
        (, int price, , ,) = AggregatorV3Interface(symbolPairList[symbolPair]).latestRoundData();
        return price;
    }
}
