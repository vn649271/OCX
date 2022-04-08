// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol"; // openzeppelin 4.5 (for solidity 0.8.x)
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import '@uniswap/lib/contracts/libraries/TransferHelper.sol';
import "./PawnNFTs.sol";
import "./OcatToken.sol";

contract PawnExchange {
    
    address payable private pnftAddress;
    address payable private ocatAddress;
    address payable private creator;
    uint256 private         pnftOcatQuote;

    constructor() {
        creator = payable(msg.sender);
        pnftOcatQuote = 10;
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
        require(msg.sender != address(0), "Invalid caller");
        _;
    }

    modifier validNftID(uint256 nftId) {
        require(nftId > 0, "Invalid NFT ID");
        _;
    }

    modifier nonZeroAddress(address _address) {
        require(_address != address(0), "Expected non-zero address");
        _;
    }

    modifier callerMustBeCreator {
        require(creator != address(0), "Invalid creator address");
        require(msg.sender == creator, "For caller expected be creator");
        _;
    }

    function setPnftAddress(address payable _pnftAddress) public 
    validCaller callerMustBeCreator nonZeroAddress(_pnftAddress) {
        pnftAddress = _pnftAddress;
    }

    function setOcatAddress(address payable _ocatAddress) public 
    validCaller nonZeroAddress(_ocatAddress) callerMustBeCreator {
        ocatAddress = _ocatAddress;
        OcatToken(ocatAddress).addOperator(address(this));
    }

    function exchangeToOcat(uint256 nftID) public validNftID(nftID) validCaller {
        uint256 ocatBalance = IERC20(ocatAddress).balanceOf(address(this));
        // Get price for the NFT
        (,,,,address currentOwner,,uint256 price,,,bool mintedNativeToken) = PawnNFTs(payable(address(pnftAddress))).allPawnNFTs(nftID);
        require(currentOwner == msg.sender, "Not owner");
        require(price > 0, "Invalid price for PNFT");
        require(pnftOcatQuote > 0, "Invalid PNFT/OCAT quote");
        uint256 quotedPrice = pnftOcatQuote * price;

        if (!mintedNativeToken) {
            // Mint some OCATs for this PNFT
            OcatToken(ocatAddress).mint(quotedPrice);
            PawnNFTs(pnftAddress).setMintedNativeToken(nftID, true);
        } else {
	    require(ocatBalance >= price, "PawnExchange.exchangeToOcat(): Insufficient balance of OCAT in the contract");
        }
        // safeTransferFrom: send NFT from caller to the address
        IERC721(pnftAddress).safeTransferFrom(msg.sender, address(this), nftID);
        // Pay OCAT for the NFT
        IERC20(ocatAddress).transfer(msg.sender, quotedPrice);
        //   Then transfer OCATs from the address to caller
        // TransferHelper.safeTransferFrom(ocatAddress, address(this), msg.sender, quotedPrice);
    }

    function exchangeFromOcat(uint256 nftID) public {
        uint256 ocatBalance = IERC20(ocatAddress).balanceOf(msg.sender);
        // Get price for the NFT
        (,,,,,,uint256 price,,,) = PawnNFTs(payable(address(pnftAddress))).allPawnNFTs(nftID);
        // uint256 price = nftItem.price;
        uint256 quotedPrice = price * pnftOcatQuote;
        require(ocatBalance >= quotedPrice, "PawnExchange.exchangeFromOcat(): Insufficient balance of OCAT in the account");
        // safeTransferFrom: send NFT from caller to the address
        TransferHelper.safeTransferFrom(ocatAddress, msg.sender, address(this), quotedPrice);
        // Pay OCAT for the NFT
        IERC721(pnftAddress).safeTransferFrom(address(this), msg.sender, nftID);
        //   Then transfer OCATs from the address to caller
        // TransferHelper.safeTransferFrom(ocatAddress, address(this), msg.sender, quotedPrice);
    } 
}
