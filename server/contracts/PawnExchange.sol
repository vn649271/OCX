// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol"; // openzeppelin 4.5 (for solidity 0.8.x)
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@uniswap/lib/contracts/libraries/TransferHelper.sol";
import "./OcxBase.sol";
import "./PawnNFTs.sol";
import "./interface/IOcat.sol";
import "./interface/IOcxPriceOracle.sol";

contract PawnExchange is OcxBase {
    
    // 2 of 4: for calculation of percentage, another 2: for no fraction
    // For example: 0.5% = 50 / (10 ** (2 + 2)) => 50
    //              0.5% of 20000 = (50 * 20000) / (10 ** 4) = 100

    event SwappedToOcat (uint256 effectiveOcats, uint256 swapfee);
    event SwappedFromOcat(uint256 effectiveOcats, uint256 swapBackFee);

    constructor() {
        creator = payable(msg.sender);
    }

    function onERC721Received(
        address payable /*operator*/,
        address payable /*from*/,
        uint256 /*tokenId*/,
        bytes calldata /*data*/
    ) external pure returns (bytes4) {
        return this.onERC721Received.selector;
    }

    modifier validCaller {
        require(msg.sender != address(this), "Error: Caller couldn't be same to this address");
        require(msg.sender != address(0), "************Invalid caller");
        _;
    }

    modifier validNftID(uint256 nftId) {
        require(nftId > 0, "Invalid NFT ID");
        _;
    }

    function exchangeToOcat(uint256 nftID) public 
    validNftID(nftID) validCaller onlyValidAddress(ocatAddress) 
    onlyValidAddress(pnftAddress) onlyValidAddress(ocxPriceOracleAddress)
    returns (uint256 effectiveOcats, uint256 txFee) {
        // Get price for the NFT
        (,,, address currentOwner,,uint256 originalPrice, uint256 currentPrice, uint256 txCounter,,) = 
            PawnNFTs(payable(address(pnftAddress))).allPawnNFTs(nftID);
        require(currentOwner == msg.sender, "Not owner");
        require(ocatPrice > 0, "Invalid PNFT/OCAT quote");

        if (txCounter == 0) { // If it is first swap operation, then mint OCATs
            IOcat(ocatAddress).mint(originalPrice);
        }
        // safeTransferFrom: send NFT from caller to the address
        IERC721(pnftAddress).safeTransferFrom(msg.sender, address(this), nftID);
        // Pay fee in OCAT to this address
        (uint256 loanFee, uint256 feeDecimals) = 
            IOcxPriceOracle(ocxPriceOracleAddress).getFeePercentage(FeeType.PNFT_OCAT_SWAP_FEE);
        txFee = 0;
        if (txCounter > 0) {
            txFee = (originalPrice * loanFee) / (10 ** feeDecimals);
        }
        require(currentPrice >= txFee, "Insufficient PNFT price for the transaction fee");
        effectiveOcats = currentPrice - txFee;
        uint256 ocatBalanceOfContract = IERC20(ocatAddress).balanceOf(address(this));
        require(ocatBalanceOfContract >= currentPrice, "Insufficient OCAT balance of the contract");
        // Pay OCAT for the NFT except swap fee or mint fee 
        IERC20(ocatAddress).transfer(msg.sender, effectiveOcats);
        emit SwappedToOcat(effectiveOcats, txFee);
    }

    function exchangeFromOcat(uint256 nftID) public 
    onlyValidCaller onlyValidAddress(ocatAddress) onlyValidAddress(pnftAddress)
    returns(uint256 effectiveOcats, uint256 swapBackFee) {
        // Get price for the NFT
        (,,,, address payable previousOwner, uint256 originalPrice,uint256 currentPrice,,,) = 
            PawnNFTs(payable(address(pnftAddress))).allPawnNFTs(nftID);
        require(msg.sender == previousOwner, "Invalid owner");
        uint256 ocatBalance = IERC20(ocatAddress).balanceOf(msg.sender);
        require(ocatBalance >= currentPrice, "Insufficient OCAT balance");
        // Get restore fee
        (uint256 restoreFee, uint256 feeDecimals) = 
            IOcxPriceOracle(ocxPriceOracleAddress).getFeePercentage(FeeType.OCAT_PNFT_SWAP_FEE);
        swapBackFee = originalPrice * restoreFee / (10 ** feeDecimals);
        effectiveOcats = currentPrice - swapBackFee;
        // safeTransferFrom: send NFT from caller to the address
        TransferHelper.safeTransferFrom(ocatAddress, msg.sender, address(this), currentPrice);
        // Distribute fee among the stakeholders
        // Pay OCAT for the NFT
        IERC721(pnftAddress).safeTransferFrom(address(this), msg.sender, nftID);
        //   Then transfer OCATs from the address to caller
        // TransferHelper.safeTransferFrom(ocatAddress, address(this), msg.sender, currentPrice);
        emit SwappedFromOcat(effectiveOcats, swapBackFee);
    } 
}
