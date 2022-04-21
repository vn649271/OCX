// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/**
 * @dev Interface of the ERC20 standard as defined in the EIP.
 */
interface IOcxPriceOracle {
    function setSubmitFee(uint64 _applicationFee, uint64 _valuationFee) external;
    function getSubmitFee() external view returns (uint64 _applicationFee, uint64 _valuationFee);
    function getBtcUsdPrice() external view returns (int256 _price);
    function getEthUsdPrice() external view returns (int256 _price);
    function getBtcEthPrice() external view returns (int256 _price);
}
