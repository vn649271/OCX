// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol"; // openzeppelin 4.5 (for solidity 0.8.x)
// import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import '../OcxBase.sol';
import '../interface/IOcxBalancer.sol';
import '../interface/IOcxExchange.sol';
import '../interface/IOcxPriceOracle.sol';
import '../interface/IOcxERC20.sol';
import "../common/OcxCommon.sol";

contract OcxBalancer is OcxBase, IOcxBalancer {

    uint256 private constant MAX_ALLOWED_OCAT_PRICE = 110;
    uint256 private constant MIN_ALLOWED_OCAT_PRICE =  90;

    OcxPrice ethAudQuote;

    constructor(
    ) {
    }
    /*
     * A user try to swap OCAT to UNI in our site
     * The system accept and swap OCAT into OCX/OCAT Uniswap pool and get OCX
     * The system swap OCX into OCX/UNI Uniswap pool and get UNI
     * The system return UNI for the user's OCAT
     * As a result, OCAT price to UNI changes
     * The stable algorithm fill back 
     */
    function run() external
    onlyValidAddress(contractAddress[CommonContracts.EXCHANGE]) onlyAdmin {
        IOcxPriceOracle priceOracle = IOcxPriceOracle(contractAddress[CommonContracts.PRICE_ORACLE]);
        IOcxExchange ocXchange = IOcxExchange(contractAddress[CommonContracts.EXCHANGE]);
        // Check ETH:AUD quote
        OcxPrice memory newEthAudQuote = priceOracle.getCurrencyRatio(CurrencyIndex.ETH, CurrencyIndex.AUD);
        if (ethAudQuote.value == 0) {
            ethAudQuote = newEthAudQuote;
        }
        if (ethAudQuote.value != newEthAudQuote.value) {
            uint changePercentage = (newEthAudQuote.value * 100) / ethAudQuote.value;
            if (changePercentage < MIN_ALLOWED_OCAT_PRICE || changePercentage > MAX_ALLOWED_OCAT_PRICE) {
                if (changePercentage > MAX_ALLOWED_OCAT_PRICE) { // If ETH price drop than 10%
                    // Force OcxExchange to burn OCAT *******
                    uint256 decreaseAmount = 
                        (
                            (100 - changePercentage) * 
                            IERC20(contractAddress[CommonContracts.OCAT]).totalSupply()
                        ) / 100;
                    // Burn bought OCAT
                    ocXchange.burnOcat(decreaseAmount);
                } else {
                    // Force OcxExchange to mint OCAT
                    uint256 increaseAmount = 
                        (
                            (changePercentage - 100) * 
                            IERC20(contractAddress[CommonContracts.OCAT]).totalSupply()
                        ) / 100;
                    // Mint bought OCAT
                    ocXchange.mintOcat(increaseAmount);
                }
            }            
            ethAudQuote = newEthAudQuote;
        }
        // Check UNI:AUD quote
        OcxPrice memory uniAudQuote = priceOracle.getCurrencyRatio(CurrencyIndex.UNI, CurrencyIndex.AUD);
        OcxPrice memory oldUniAudQuote = ocXchange.getQuote(CurrencyIndex.UNI, CurrencyIndex.AUD);
        if (oldUniAudQuote.value == 0) {
            ocXchange.setQuote(CurrencyIndex.UNI, CurrencyIndex.AUD, uniAudQuote);
            oldUniAudQuote = uniAudQuote;
        }
        if (oldUniAudQuote.value != uniAudQuote.value) {
            // Update OCAT:OCX quote by change rate of OCAT:UNI
            uint changePercentage = (uniAudQuote.value * 100) / oldUniAudQuote.value;
            OcxPrice memory oldOcatOcxQuote = ocXchange.getQuote(CurrencyIndex.OCAT, CurrencyIndex.OCX);
            ocXchange.setQuote(
                CurrencyIndex.OCAT, 
                CurrencyIndex.OCX,
                OcxPrice(oldOcatOcxQuote.value * changePercentage / 100, QUOTE_DECIMALS)
            );
        }
    }
}
