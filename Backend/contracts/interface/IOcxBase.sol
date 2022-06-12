// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '../common/OcxCommon.sol';

/**
 * @dev Interface of the ERC20 standard as defined in the EIP.
 */
interface IOcxBase {
    function setAddress(CommonContracts contractIndex, address payable _address) external;
    function setOcatPrice(uint256 price) external;
    function convertToOcat(uint256 price) external returns(uint256 _ocatPrice);
}
