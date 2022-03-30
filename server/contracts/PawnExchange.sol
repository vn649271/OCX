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

    constructor() {
        creator = payable(msg.sender);
    }

    function onERC721Received(
        address payable operator,
        address payable from,
        uint256 tokenId,
        bytes calldata data
    ) external pure returns (bytes4) {
        return this.onERC721Received.selector;
    }

    function setPnftAddress(address payable _pnftAddress) public {
        require(creator == msg.sender, "OcxExchange.setPNFTAddress(): Caller for  must be creator");
        require(_pnftAddress != address(0), "OcxExchange.setPNFTAddress(): Invalid parameter");
        pnftAddress = _pnftAddress;
    }

    function setOcatAddress(address payable _ocatAddress) public {
        require(creator == msg.sender, "OcxExchange.setOcatAddress(): Caller for  must be creator");
        require(_ocatAddress != address(0), "OcxExchange.setOcatAddress(): Invalid parameter");
        ocatAddress = _ocatAddress;
    }

    function exchangeToOcat(uint256 nftID) public {
        require(msg.sender != address(this), "exchangeToOcat(): Error: Caller couldn't be same to this address");
        require(msg.sender != address(0), "exchangeToOcat(): Invalid caller");
        require(nftID > 0, "exchangeToOcat(): Invalid NFT ID");
        uint256 ocatBalance = IERC20(ocatAddress).balanceOf(address(this));
        // Get price for the NFT
        (,,,,,,uint256 price,,) = PawnNFTs(payable(address(pnftAddress))).allPawnNFTs(nftID);
        // uint256 price = nftItem.price;
        require(ocatBalance >= price, "Insufficient balance of OCAT in the contract");
        // safeTransferFrom: send NFT from caller to the address
        IERC721(pnftAddress).safeTransferFrom(msg.sender, address(this), nftID);
        // Pay OCAT for the NFT
        IERC20(ocatAddress).transfer(msg.sender, price);
        //   Then transfer OCATs from the address to caller
        // TransferHelper.safeTransferFrom(ocatAddress, address(this), msg.sender, price);
    }

    function exchangeFromOcat(uint256 nftID) public {
        require(msg.sender != address(this), "exchangeToOcat(): Error: Caller couldn't be same to this address");
        require(msg.sender != address(0), "exchangeToOcat(): Invalid caller");
        require(nftID > 0, "exchangeToOcat(): Invalid NFT ID");
        uint256 ocatBalance = IERC20(ocatAddress).balanceOf(msg.sender);
        // Get price for the NFT
        (,,,,,,uint256 price,,) = PawnNFTs(payable(address(pnftAddress))).allPawnNFTs(nftID);
        // uint256 price = nftItem.price;
        require(ocatBalance >= price, "Insufficient balance of OCAT in the account");
        // safeTransferFrom: send NFT from caller to the address
        TransferHelper.safeTransferFrom(ocatAddress, msg.sender, address(this), price);
        // Pay OCAT for the NFT
        IERC721(pnftAddress).safeTransferFrom(address(this), msg.sender, nftID);
        //   Then transfer OCATs from the address to caller
        // TransferHelper.safeTransferFrom(ocatAddress, address(this), msg.sender, price);
    } 
}