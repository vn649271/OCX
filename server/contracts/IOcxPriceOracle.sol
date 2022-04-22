// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./OcxCommon.sol";

/**
 * @dev Interface of the ERC20 standard as defined in the EIP.
 */
interface IOcxPriceOracle {
    function setFeePercentage(FeeType feeType, uint256 percentValue) external;
    function getFeePercentage(FeeType feeType) external view 
        returns(uint256 percentage, uint256 feeDecimals);
    function setSubmitFee(uint256 _applicationFee, uint256 _valuationFee) external;
    function getSubmitFee() external view 
        returns (uint256 application, uint256 valuation);
    function getWeeklyFee(uint256 assetPrice) external view 
        returns(uint256 value, uint256 feeDecimals);
    function getPnftFeePercentages() external view 
        returns(uint256 mintFee, uint256 loanFee, uint256 restoreFee, uint256 feeDecimals);
    function getBtcUsdPrice() external view returns (int256 _price);
    function getEthUsdPrice() external view returns (int256 _price);
    function getBtcEthPrice() external view returns (int256 _price);
}
