// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol"; // openzeppelin 4.5 (for solidity 0.8.x)
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import '@uniswap/lib/contracts/libraries/TransferHelper.sol';
import './OcxBase.sol';
import './IOcat.sol';
import "./PawnNFTs.sol";

contract PawnExchange is OcxBase {
    
    // 2 of 4: for calculation of percentage, another 2: for no fraction
    // For example: 0.5% = 50 / (10 ** (2 + 2)) => 50
    //              0.5% of 20000 = (50 * 20000) / (10 ** 4) = 100

    event SwappedToOcat (uint256 realOcats, uint256 swapfee);
    event SwappedFromOcat(uint256 realOcats, uint256 swapBackFee);

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

    function collectFee(uint256 fee) public {
        IERC20(ocatAddress).transfer(address(this), fee);
    }

    function exchangeToOcat(uint256 nftID) public 
    validNftID(nftID) validCaller 
    returns (uint256 realOcats, uint256 swapFee) {
        // Get price for the NFT
        (,,, address currentOwner,, uint256 price, uint256 mintFee, uint256 numberOfTransfers,) = 
            PawnNFTs(payable(address(pnftAddress))).allPawnNFTs(nftID);
        require(currentOwner == msg.sender, "Not owner");
        require(ocatPrice > 0, "Invalid PNFT/OCAT quote");

        uint256 quotedOcats = convertToOcat(price);
        swapFee = (quotedOcats * fees[FeeType.PNFT_OCAT_SWAP_FEE]) / (10 ** FEE_DECIMAL);
        realOcats = quotedOcats - swapFee;
        if (numberOfTransfers == 0) { // If it is first swap operation, then mint OCATs
            IOcat(ocatAddress).mint(address(this), quotedOcats + mintFee);
        }
        // uint256 ocatBalance = IERC20(ocatAddress).balanceOf(address(this));
        // require(ocatBalance >= price, "PawnExchange.exchangeToOcat(): Insufficient balance of OCAT in the contract");
        // safeTransferFrom: send NFT from caller to the address
        IERC721(pnftAddress).safeTransferFrom(msg.sender, address(this), nftID);
        // Pay fee in OCAT to this address
        uint256 totalFee = swapFee;
        if (numberOfTransfers == 0) {
            totalFee += mintFee;
        }
        collectFee(totalFee);
        // Pay OCAT for the NFT
        IERC20(ocatAddress).transfer(msg.sender, realOcats);
        emit SwappedToOcat(realOcats, totalFee);
    }

    function exchangeFromOcat(uint256 nftID) public 
    onlyValidCaller returns(uint256 realOcats, uint256 swapBackFee) {
        uint256 ocatBalance = IERC20(ocatAddress).balanceOf(msg.sender);
        // Get price for the NFT
        (,,,,,uint256 price,,,) = PawnNFTs(payable(address(pnftAddress))).allPawnNFTs(nftID);
        // uint256 price = nftItem.price;
        uint256 quotedOcats = convertToOcat(price);
        swapBackFee = quotedOcats * fees[FeeType.OCAT_PNFT_SWAP_FEE] / (10 ** FEE_DECIMAL);
        realOcats = quotedOcats - swapBackFee;

        require(ocatBalance >= quotedOcats, "PawnExchange.exchangeFromOcat(): Insufficient balance of OCAT in the account");
        // safeTransferFrom: send NFT from caller to the address
        TransferHelper.safeTransferFrom(ocatAddress, msg.sender, address(this), quotedOcats);
        // Distribute fee among the stakeholders

        // Pay OCAT for the NFT
        IERC721(pnftAddress).safeTransferFrom(address(this), msg.sender, nftID);
        //   Then transfer OCATs from the address to caller
        // TransferHelper.safeTransferFrom(ocatAddress, address(this), msg.sender, quotedOcats);
        emit SwappedFromOcat(realOcats, swapBackFee);
    } 
}
