//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract OcxPriceOracle_Chainlink {

    AggregatorV3Interface internal priceFeed;

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

    function getPrice(string memory symbolPair) public view returns (int price) {
        (, price, , ,) = AggregatorV3Interface(symbolPairList[symbolPair]).latestRoundData();
    }
}
