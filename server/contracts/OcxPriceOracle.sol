// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "witnet-solidity-bridge/contracts/interfaces/IWitnetPriceRouter.sol";
import "./OcxBase.sol";
import "./interface/IOcxPriceOracle.sol";

contract OcxPriceOracle is OcxBase, IOcxPriceOracle {

    IWitnetPriceRouter public router;
    mapping(FeeType => uint256) internal feePercentages;
    uint256  public _feePercentageDecimals = 6;
    uint256  public applicationFee = 100;
    uint256  public valuationFee = 50;
    uint256  private minimumPawnablePrice = 5000;
    uint256  private weeklyFeePercentage = 62400; // 6.24%
    mapping(string => CurrencyPriceInfo) private cryptoPrice;
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
    function setFeePercentage(FeeType feeType, uint256 percentValue) public override
    onlyAdmin {
        feePercentages[feeType] = percentValue;
    }
    function getFeePercentage(FeeType feeType) public view override
    returns(uint256 percentage, uint256 feeDecimals) {
        require(feeType > FeeType.PNFT_MINT_FEE && 
                feeType <= FeeType.FEE_TYPE_SIZE, "Invalid fee type");
        percentage = feePercentages[feeType];
        feeDecimals = _feePercentageDecimals;
    }
    function setSubmitFee(uint256 _applicationFee, uint256 _valuationFee) public override
    onlyAdmin {
        applicationFee = _applicationFee;
        valuationFee = _valuationFee;
    }
    /*
     * Returns value of the application and valuation fee in fiat currency($)
     */
    function getSubmitFee() public view override
    returns (uint256 application, uint256 valuation) {
        application = applicationFee;
        valuation = valuationFee;
    }
    function getWeeklyFee(uint256 assetPrice) public view override
    returns(uint256 value, uint256 feeDecimals) {
        feeDecimals = _feePercentageDecimals;
        if (assetPrice <= minimumPawnablePrice) {
            assetPrice = minimumPawnablePrice;
        }
        value = assetPrice * (weeklyFeePercentage / 52);
    }
    function getPnftFeePercentages() public view override
    returns(uint256 mintFee, uint256 loanFee, uint256 restoreFee, uint256 feeDecimals) {
        feeDecimals = _feePercentageDecimals;
        mintFee = feePercentages[FeeType.PNFT_MINT_FEE];
        loanFee = feePercentages[FeeType.PNFT_OCAT_SWAP_FEE];
        restoreFee = feePercentages[FeeType.OCAT_PNFT_SWAP_FEE];
    }
    function setCryptoPrice(
            string memory cryptoName, 
            string memory fiatName, 
            uint256 price, 
            uint8 priceDecimals
    ) public override {
        cryptoPrice[cryptoName].vs[fiatName].value = price;
        cryptoPrice[cryptoName].vs[fiatName].decimals = priceDecimals;
    }
    function getCryptoPrice(
            string memory cryptoName, 
            string memory fiatName
    ) public override returns(OcxPrice memory priceInfo) {
        (int256 btcUsdPrice,,) = router.valueFor(0x24beead43216e490aa240ef0d32e18c57beea168f06eabb94f5193868d500946);
        cryptoPrice["BTC"].vs["USD"].value = uint256(btcUsdPrice);
        cryptoPrice["BTC"].vs["USD"].decimals = 6;
        (int256 ethUsdPrice,,) = router.valueFor(0x3d15f7018db5cc80838b684361aaa100bfadf8a11e02d5c1c92e9c6af47626c8);
        cryptoPrice["ETH"].vs["USD"].value = uint256(ethUsdPrice);
        cryptoPrice["ETH"].vs["USD"].decimals = 6;

        priceInfo = cryptoPrice[cryptoName].vs[fiatName];
    }
}