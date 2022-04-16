// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./OcxAdmin.sol";
import "./OcxCommon.sol";

contract OcxBase is OcxAdmin {

    mapping(FeeType => uint32)  internal fees;
    uint256                     internal ocatPrice;
    address payable             internal ocatAddress;
    address payable             internal ocxAddress;
    address payable             internal pnftAddress;
    address payable             internal feeManager;

    constructor() {
        ocatPrice = 1;
        fees[FeeType.PNFT_OCAT_SWAP_FEE] = 50; // 0.5% 
        fees[FeeType.OCAT_PNFT_SWAP_FEE] = 50; // 0.5%
        fees[FeeType.PNFT_MINT_FEE] = 50;     // 0.5% 
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
        return ocatPrice; 
    }
    function setOcatPrice(uint256 _price) public 
    onlyValidCaller onlyAdmin {
        require(_price > 0, "Invalid price");
        ocatPrice = _price;
    }
    function setPnftAddress(address payable _pnftAddress) public 
    onlyValidCaller onlyCreator onlyValidAddress(_pnftAddress) {
        pnftAddress = _pnftAddress;
    }
    function getFee(FeeType feeType) public view returns(uint32) {
        return fees[feeType];
    }
    function setFeeManager(address payable _feeManager) public 
    onlyCreator onlyValidAddress(_feeManager) {
        feeManager = _feeManager;
    }
    function setOcxAddress(address payable _ocxAddress) public 
    onlyCreator onlyValidAddress(_ocxAddress) {
        ocxAddress = _ocxAddress;
    }
}