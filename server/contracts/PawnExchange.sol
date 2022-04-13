// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol"; // openzeppelin 4.5 (for solidity 0.8.x)
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import '@uniswap/lib/contracts/libraries/TransferHelper.sol';
import "./PawnNFTs.sol";
import "./IOcat.sol";
import "./CommonTypes.sol";
import "./AdministratedContract.sol";

contract PawnExchange is AdministratedContract {
    
    address payable private pnftAddress;
    address payable private ocatAddress;
    address payable private feeManager;
    uint256         private pnftOcatQuote;

    // 2 of 4: for calculation of percentage, another 2: for no fraction
    // For example: 0.5% = 50 / (10 ** (2 + 2)) => 50
    //              0.5% of 20000 = (50 * 20000) / (10 ** 4) = 100
    uint8           private feeDecimal = 4; 
    mapping(FeeType => uint32) private fees;
    uint64          private minPnftPrice = 5000;

    event SwappedToOcat (uint256 realPrice, uint256 fee);

    constructor() {
        creator = payable(msg.sender);
        fees[FeeType.PNFT_LOAN_FEE] = 50;     // 0.5% 
        fees[FeeType.PNFT_GETBACK_FEE] = 50; // 0.5%
        pnftOcatQuote = 1;
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

    function setPnftAddress(address payable _pnftAddress) public 
    validCaller onlyCreator mustNoneZeroAddress(_pnftAddress) {
        pnftAddress = _pnftAddress;
    }

    function setOcatAddress(address payable _ocatAddress) public 
    validCaller mustNoneZeroAddress(_ocatAddress) onlyCreator {
        ocatAddress = _ocatAddress;
    }

    function setFeeManager(address payable _feeManager) public 
    onlyCreator mustNoneZeroAddress(_feeManager) {
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

    function getFee(FeeType feeType) public view returns(uint32) {
        require(
            feeType == FeeType.PNFT_LOAN_FEE ||
            feeType == FeeType.PNFT_GETBACK_FEE,
            "Invalid fee type"
        );
        return fees[feeType];
    }

    function exchangeToOcat(uint256 nftID) public 
    validNftID(nftID) validCaller 
    returns (uint256, uint256) {
        // Get price for the NFT
        (,,,,address currentOwner,,uint256 price,,,bool mintedNativeToken) = PawnNFTs(payable(address(pnftAddress))).allPawnNFTs(nftID);
        require(currentOwner == msg.sender, "Not owner");
        require(price >= minPnftPrice, "Too small price for PNFT");
        require(pnftOcatQuote > 0, "Invalid PNFT/OCAT quote");

        uint256 quotedPrice = pnftOcatQuote * price;
        uint256 loanFee = quotedPrice * fees[FeeType.PNFT_LOAN_FEE] / (10 ** feeDecimal);
        uint256 realPrice = quotedPrice - loanFee;

        if (!mintedNativeToken) {
            // Mint some OCATs for this PNFT
            IOcat(ocatAddress).mint(address(this), quotedPrice);
            PawnNFTs(pnftAddress).setMintedNativeToken(nftID, true);
        } else {
            uint256 ocatBalance = IERC20(ocatAddress).balanceOf(address(this));
	        require(ocatBalance >= price, "PawnExchange.exchangeToOcat(): Insufficient balance of OCAT in the contract");
        }
        // safeTransferFrom: send NFT from caller to the address
        IERC721(pnftAddress).safeTransferFrom(msg.sender, address(this), nftID);
        // Pay fee in OCAT to this address
        IERC20(ocatAddress).transfer(address(this), loanFee);
        // Pay OCAT for the NFT
        IERC20(ocatAddress).transfer(msg.sender, realPrice);
        emit SwappedToOcat(realPrice, loanFee);
        //   Then transfer OCATs from the address to caller
        // TransferHelper.safeTransferFrom(ocatAddress, address(this), msg.sender, quotedPrice);
        return (realPrice, loanFee);
    }

    function exchangeFromOcat(uint256 nftID) public {
        uint256 ocatBalance = IERC20(ocatAddress).balanceOf(msg.sender);
        // Get price for the NFT
        (,,,,,,uint256 price,,,) = PawnNFTs(payable(address(pnftAddress))).allPawnNFTs(nftID);
        // uint256 price = nftItem.price;
        uint256 quotedPrice = price * pnftOcatQuote;
        uint256 getbackFee = quotedPrice * fees[FeeType.PNFT_GETBACK_FEE] / (10 ** feeDecimal);
        uint256 realPrice = quotedPrice - getbackFee;

        require(ocatBalance >= quotedPrice, "PawnExchange.exchangeFromOcat(): Insufficient balance of OCAT in the account");
        // safeTransferFrom: send NFT from caller to the address
        TransferHelper.safeTransferFrom(ocatAddress, msg.sender, address(this), quotedPrice);
        // Distribute fee among the stakeholders

        // Pay OCAT for the NFT
        IERC721(pnftAddress).safeTransferFrom(address(this), msg.sender, nftID);
        //   Then transfer OCATs from the address to caller
        // TransferHelper.safeTransferFrom(ocatAddress, address(this), msg.sender, quotedPrice);
    } 
}
