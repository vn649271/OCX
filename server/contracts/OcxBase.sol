// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./OcxAdmin.sol";
import "./OcxCommon.sol";

contract OcxBase is OcxAdmin {

    mapping(FeeType => uint256) internal fees;
    uint256                     internal ocatPrice;
    uint8                       constant OCAT_PRICE_DECIMALS = 2;
    address payable             internal ocatAddress;
    address payable             internal ocxAddress;
    address payable             internal pnftAddress;
    address payable             internal feeManager;


    constructor() {
        ocatPrice = 100;
        fees[FeeType.PNFT_OCAT_SWAP_FEE] = 65; // 0.65% 
        fees[FeeType.OCAT_PNFT_SWAP_FEE] = 65; // 0.65%
        fees[FeeType.PNFT_MINT_FEE] = 65;     // 0.65% 
   }

    modifier onlyValidCaller virtual {
        require(msg.sender != address(0), "Expected non-zero address");
        _;
    }
    function _compareStrings(string memory a, string memory b) internal pure returns (bool) {
        return (keccak256(abi.encodePacked((a))) == keccak256(abi.encodePacked((b))));
    }
    function setOcatAddress(address payable _ocatAddress) public 
    onlyValidCaller onlyValidAddress(_ocatAddress) onlyAdmin {
        ocatAddress = _ocatAddress;
    }
    function getOcatPrice() public view returns(uint256) { 
        return ocatPrice / (10 ** OCAT_PRICE_DECIMALS);
    }
    function setOcatPrice(uint256 _price) public 
    onlyAdmin {
        require(_price > 0, "Invalid price");
        ocatPrice = _price;
    }
    function convertToOcat(uint256 price) public view returns(uint256 _ocatPrice) {
        _ocatPrice = ocatPrice * price / (10 ** OCAT_PRICE_DECIMALS);
    }
    function setPnftAddress(address payable _pnftAddress) public 
    onlyCreator onlyValidAddress(_pnftAddress) {
        pnftAddress = _pnftAddress;
    }
    function setFee(FeeType feeType, uint256 feeValue) public
    onlyAdmin {
        fees[feeType] = feeValue;
    }
    function getFee(FeeType feeType) public view returns(uint256) {
        require(feeType > FeeType.PNFT_OCAT_SWAP_FEE && 
                feeType <= FeeType.PNFT_MINT_FEE, "Invalid fee type"); 
        return fees[feeType];
    }
    function setOcxAddress(address payable _ocxAddress) public 
    onlyCreator onlyValidAddress(_ocxAddress) {
        ocxAddress = _ocxAddress;
    }
}