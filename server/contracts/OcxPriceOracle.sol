// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "witnet-solidity-bridge/contracts/interfaces/IWitnetPriceRouter.sol";
import "./OcxBase.sol";

contract OcxPriceOracle is OcxBase {

    IWitnetPriceRouter public router;
    uint64  public applicationFee = 100;
    uint64  public valuationFee = 50;
    uint64  private minimumPawnablePrice = 5000;
    uint64  private weeklyFeePercentage = 624; // 6.24%
    uint8  public weeklyFeeDecimals = 6;
    /**
     * IMPORTANT: replace the address below with the WitnetPriceRouter address
     * of the network you are using! Please find the address here:
     * https://docs.witnet.io/smart-contracts/price-feeds/contract-addresses
     */
    constructor() {
        // router = IWitnetPriceRouter(0x83a757eae821ad7b520d9a74952337138a80b2af); // for MainNet
        router = IWitnetPriceRouter(0x1cF3Aa9DBF4880d797945726B94B9d29164211BE); // for Goerli
    }
    function setSubmitFee(uint64 _applicationFee, uint64 _valuationFee) public 
    onlyAdmin {
        applicationFee = _applicationFee;
        valuationFee = _valuationFee;
    }
    function getSubmitFee() public view returns (uint64 application, uint64 valuation) {
        application = applicationFee;
        valuation = valuationFee;
    }
    function getWeeklyFee(uint256 assetPrice) public view 
    returns(uint256 value, uint8 feeDecimals) {
        feeDecimals = weeklyFeeDecimals;
        if (assetPrice <= minimumPawnablePrice) {
            assetPrice = minimumPawnablePrice;
        }
        value = assetPrice * ((weeklyFeePercentage * 100) / 52);
    }
    /// Returns the BTC / USD price (6 decimals), ultimately provided by the Witnet oracle.
    function getBtcUsdPrice() public view returns (int256 _price) {
        (_price,,) = router.valueFor(0x24beead43216e490aa240ef0d32e18c57beea168f06eabb94f5193868d500946);
    }
    /// Returns the ETH / USD price (6 decimals), ultimately provided by the Witnet oracle.
    function getEthUsdPrice() public view returns (int256 _price) {
        (_price,,) = router.valueFor(0x3d15f7018db5cc80838b684361aaa100bfadf8a11e02d5c1c92e9c6af47626c8);
    }
    /// Returns the BTC / ETH price (6 decimals), derived from the ETH/USD and 
    /// the BTC/USD pairs that were ultimately provided by the Witnet oracle.
    function getBtcEthPrice() public view returns (int256 _price) {
        return (1000000 * getBtcUsdPrice()) / getEthUsdPrice();
    }
}