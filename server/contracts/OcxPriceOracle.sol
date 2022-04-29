// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "witnet-solidity-bridge/contracts/interfaces/IWitnetPriceRouter.sol";
import "./OcxBase.sol";

contract OcxPriceOracle is OcxBase {

    IWitnetPriceRouter public router;
    mapping(FeeType => uint256) internal feePercentages;
    uint256  public _feePercentageDecimals = 6;
    uint256  public applicationFee = 100;
    uint256  public valuationFee = 50;
    uint256  private minimumPawnablePrice = 5000;
    uint256  private weeklyFeePercentage = 62400; // 6.24%
    uint256  private ethAudPrice = 0;
    uint256  public constant FIAT_PRICE_DECIMALS = 6;
    /**
     * IMPORTANT: replace the address below with the WitnetPriceRouter address
     * of the network you are using! Please find the address here:
     * https://docs.witnet.io/smart-contracts/price-feeds/contract-addresses
     */
    constructor() {
        // router = IWitnetPriceRouter(0x83a757eae821ad7b520d9a74952337138a80b2af); // for MainNet
        router = IWitnetPriceRouter(0x1cF3Aa9DBF4880d797945726B94B9d29164211BE); // for Goerli
        feePercentages[FeeType.PNFT_MINT_FEE] = 8000; // 0.8% 
        feePercentages[FeeType.PNFT_OCAT_SWAP_FEE] = 8000; // 0.8% 
        feePercentages[FeeType.OCAT_PNFT_SWAP_FEE] = 8000; // 0.8%
    }
    /* 
     * feeValue = real_percent_value * (10 ** _feePercentageDecimals) = real_percent_value * 10^6
     */
    function setFeePercentage(FeeType feeType, uint256 percentValue) public
    onlyAdmin {
        feePercentages[feeType] = percentValue;
    }
    function getFeePercentage(FeeType feeType) public view 
    returns(uint256 percentage, uint256 feeDecimals) {
        require(feeType > FeeType.PNFT_MINT_FEE && 
                feeType <= FeeType.FEE_TYPE_SIZE, "Invalid fee type");
        percentage = feePercentages[feeType];
        feeDecimals = _feePercentageDecimals;
    }
    function setSubmitFee(uint256 _applicationFee, uint256 _valuationFee) public 
    onlyAdmin {
        applicationFee = _applicationFee;
        valuationFee = _valuationFee;
    }
    /*
     * Returns value of the application and valuation fee in fiat currency($)
     */
    function getSubmitFee() public view returns (uint256 application, uint256 valuation) {
        application = applicationFee;
        valuation = valuationFee;
    }
    function getWeeklyFee(uint256 assetPrice) public view 
    returns(uint256 value, uint256 feeDecimals) {
        feeDecimals = _feePercentageDecimals;
        if (assetPrice <= minimumPawnablePrice) {
            assetPrice = minimumPawnablePrice;
        }
        value = assetPrice * (weeklyFeePercentage / 52);
    }
    function getPnftFeePercentages() public view 
    returns(uint256 mintFee, uint256 loanFee, uint256 restoreFee, uint256 feeDecimals) {
        feeDecimals = _feePercentageDecimals;
        mintFee = feePercentages[FeeType.PNFT_MINT_FEE];
        loanFee = feePercentages[FeeType.PNFT_OCAT_SWAP_FEE];
        restoreFee = feePercentages[FeeType.OCAT_PNFT_SWAP_FEE];
    }
    /// Returns the BTC / USD price (6 decimals), ultimately provided by the Witnet oracle.
    function getBtcUsdPrice() public view returns (uint256 _price, uint256 _decimals) {
        (int256 _v,,) = router.valueFor(0x24beead43216e490aa240ef0d32e18c57beea168f06eabb94f5193868d500946);
        _price = uint256(_v);
        _decimals = 6;
    }
    /// Returns the ETH / USD price (6 decimals), ultimately provided by the Witnet oracle.
    function getEthUsdPrice() public view returns (uint256 _price, uint256 _decimals) {
        (int256 _v,,) = router.valueFor(0x3d15f7018db5cc80838b684361aaa100bfadf8a11e02d5c1c92e9c6af47626c8);
        _price = uint256(_v);
        _decimals = 6;
    }
    /// Returns the BTC / ETH price (6 decimals), derived from the ETH/USD and 
    /// the BTC/USD pairs that were ultimately provided by the Witnet oracle.
    function getBtcEthPrice() public view returns (uint256 _price, uint256 _decimals) {
        (uint256 btcUsdPrice, ) = getBtcUsdPrice();
        (uint256 ethUsdPrice, ) = getEthUsdPrice();
        _decimals = 6;
        _price = (10 ** _decimals) * btcUsdPrice / ethUsdPrice;
    }
    // price must be value was timed by 10^6
    function setEthAudPrice(uint256 price) public onlyAdmin {
        ethAudPrice = price;
    }
    function getEthAudPrice() external view returns(uint256 price, uint256 priceDecimals) {
        price = ethAudPrice;
        priceDecimals = FIAT_PRICE_DECIMALS;
    }
}