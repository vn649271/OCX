// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

enum CommonContracts {
    WETH, OCAT, OCX, PNFT, PRICE_ORACLE, EXCHANGE, BALANCER, CONRACT_COUNT
}
struct OcxPrice {
    uint256     value;
    uint8       decimals;
}
/**
 * @dev Interface of the ERC20 standard as defined in the EIP.
 */
interface IOcxBase {
    function setCommonContractAddress(CommonContracts contractIndex, address payable _address) external;
    function setOcatPrice(uint256 price) external;
    function convertToOcat(uint256 price) external returns(uint256 _ocatPrice);
}
