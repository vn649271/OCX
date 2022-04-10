// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v4.5.0) (token/ERC20/IERC20.sol)

pragma solidity ^0.8.0;

/**
 * @dev Interface of the ERC20 standard as defined in the EIP.
 */
interface IOcat {
    modifier isAllowedOperator(address operator) virtual ;
    function addOperator(address operator) external payable ;
    function getAllowedOperators() external view returns(address[] memory);
    function mint(address from, uint256 amount) external;
}
