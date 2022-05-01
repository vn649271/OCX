// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
import './IOcxBase.sol';

struct TokenPrice {
    mapping(CommonContracts => OcxPrice) to;
}
/**
 * @dev Interface of the ERC20 standard as defined in the EIP.
 */
interface IOcxBalancer {
    function setPrice(CommonContracts srcTkn, CommonContracts dstTkn, uint256 price, uint8 decimals) external;
    function getPrice(CommonContracts srcTkn, CommonContracts dstTkn) external view returns(OcxPrice memory);
}
