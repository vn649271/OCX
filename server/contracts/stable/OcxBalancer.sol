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

    OcxPrice ethAudPriceInfo;
    OcxPrice uniAudPriceInfo;

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
        // Get ETH:AUD ratio
        OcxPrice memory _ethAudPriceObj = IOcxPriceOracle(contractAddress[CommonContracts.PRICE_ORACLE])
                                            .getCurrencyRatio(CurrencyIndex.ETH, CurrencyIndex.AUD);
        if (ethAudPriceInfo.value == 0) {
            ethAudPriceInfo = _ethAudPriceObj;
        }
        if (ethAudPriceInfo.value != _ethAudPriceObj.value) {
            uint changePercentage = (_ethAudPriceObj.value * 100) / ethAudPriceInfo.value;
            if (changePercentage < MIN_ALLOWED_OCAT_PRICE || changePercentage > MAX_ALLOWED_OCAT_PRICE) {
                if (changePercentage > MAX_ALLOWED_OCAT_PRICE) { // If ETH price drop than 10%
                    // Force OcxExchange to burn OCAT *******
                    uint256 decreaseAmount = 
                        (
                            (100 - changePercentage) * 
                            IERC20(contractAddress[CommonContracts.OCAT]).totalSupply()
                        ) / 
                        100;
                    // Burn bought OCAT
                    IOcxExchange(contractAddress[CommonContracts.EXCHANGE]).burnOcat(decreaseAmount);
                } else {
                    // Force OcxExchange to mint OCAT
                    uint256 increaseAmount = 
                        (
                            (changePercentage - 100) * 
                            IERC20(contractAddress[CommonContracts.OCAT]).totalSupply()
                        ) / 
                        100;
                    // Mint bought OCAT
                    IOcxExchange(contractAddress[CommonContracts.EXCHANGE]).mintOcat(increaseAmount);
                }
                ethAudPriceInfo.value = _ethAudPriceObj.value;
            }            
        }
        
    }
}
