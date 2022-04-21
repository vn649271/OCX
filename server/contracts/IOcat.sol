// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/**
 * @dev Interface of the ERC20 standard as defined in the EIP.
 */
interface IOcat {
    function mint(uint256 amount) external;
    function decimals() external returns (uint8);
}
