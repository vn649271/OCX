// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol"; // openzeppelin 4.5 (for solidity 0.8.x)
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import '@uniswap/lib/contracts/libraries/TransferHelper.sol';
import './OcxBase.sol';
import "./PawnNFTs.sol";

contract PawnExchange is OcxBase {
    
    address payable private feeManager;

    // 2 of 4: for calculation of percentage, another 2: for no fraction
    // For example: 0.5% = 50 / (10 ** (2 + 2)) => 50
    //              0.5% of 20000 = (50 * 20000) / (10 ** 4) = 100
    uint64          private minPnftPrice = 5000;

    event SwappedToOcat (uint256 realPrice, uint256 swapfee);
    event SwappedFromOcat(uint256 realPrice, uint256 swapBackFee);

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

    function setFeeManager(address payable _feeManager) public 
    onlyCreator onlyValidAddress(_feeManager) {
        feeManager = _feeManager;
    }

    function setMinPnftPrice(uint8 _minPnftPrice) public 
    onlyAdmin {
        minPnftPrice = _minPnftPrice;
    }

    function setFee(FeeType feeType, uint32 feeValue) public
    onlyAdmin {
        fees[feeType] = feeValue;
    }

    function exchangeToOcat(uint256 nftID) public 
    validNftID(nftID) validCaller 
    returns (uint256 realPrice, uint256 swapFee) {
        // Get price for the NFT
        (,,,,address currentOwner,,uint256 price,,) = PawnNFTs(payable(address(pnftAddress))).allPawnNFTs(nftID);
        require(currentOwner == msg.sender, "Not owner");
        require(price >= minPnftPrice, "Too small price for PNFT");
        require(ocatPrice > 0, "Invalid PNFT/OCAT quote");

        uint256 quotedPrice = ocatPrice * price;
        swapFee = quotedPrice * fees[FeeType.PNFT_MINT_FEE] / (10 ** FEE_DECIMAL);
        realPrice = quotedPrice - swapFee;

        uint256 ocatBalance = IERC20(ocatAddress).balanceOf(address(this));
        require(ocatBalance >= price, "PawnExchange.exchangeToOcat(): Insufficient balance of OCAT in the contract");
        // safeTransferFrom: send NFT from caller to the address
        IERC721(pnftAddress).safeTransferFrom(msg.sender, address(this), nftID);
        // Pay fee in OCAT to this address
        IERC20(ocatAddress).transfer(address(this), swapFee);
        // Pay OCAT for the NFT
        IERC20(ocatAddress).transfer(msg.sender, realPrice);
        emit SwappedToOcat(realPrice, swapFee);
        //   Then transfer OCATs from the address to caller
        // TransferHelper.safeTransferFrom(ocatAddress, address(this), msg.sender, quotedPrice);
        return (realPrice, swapFee);
    }

    function exchangeFromOcat(uint256 nftID) public 
    onlyValidCaller returns(uint256 realPrice, uint256 swapBackFee) {
        uint256 ocatBalance = IERC20(ocatAddress).balanceOf(msg.sender);
        // Get price for the NFT
        (,,,,,,uint256 price,,) = PawnNFTs(payable(address(pnftAddress))).allPawnNFTs(nftID);
        // uint256 price = nftItem.price;
        uint256 quotedPrice = price * ocatPrice;
        swapBackFee = quotedPrice * fees[FeeType.OCAT_PNFT_SWAP_FEE] / (10 ** FEE_DECIMAL);
        realPrice = quotedPrice - swapBackFee;

        require(ocatBalance >= quotedPrice, "PawnExchange.exchangeFromOcat(): Insufficient balance of OCAT in the account");
        // safeTransferFrom: send NFT from caller to the address
        TransferHelper.safeTransferFrom(ocatAddress, msg.sender, address(this), quotedPrice);
        // Distribute fee among the stakeholders

        // Pay OCAT for the NFT
        IERC721(pnftAddress).safeTransferFrom(address(this), msg.sender, nftID);
        //   Then transfer OCATs from the address to caller
        // TransferHelper.safeTransferFrom(ocatAddress, address(this), msg.sender, quotedPrice);
        emit SwappedFromOcat(realPrice, swapBackFee);
    } 
}
