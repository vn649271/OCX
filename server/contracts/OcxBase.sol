// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./OcxAdmin.sol";
import "./OcxCommon.sol";
import './IOcat.sol';

contract OcxBase is OcxAdmin {

    mapping(FeeType => uint256) internal fees;
    uint256                     public ocatPrice;
    uint8                       constant OCAT_PRICE_DECIMALS = 2;
    address payable             public ocatAddress;
    address payable             public ocxAddress;
    address payable             public pnftAddress;
    address payable             public ocxPriceOracleAddress;
    uint8                       constant FEE_DECIMAL = 3;

    constructor() {
        ocatPrice = 100;
        fees[FeeType.PNFT_MINT_FEE] = 8; // 0.8% 
        fees[FeeType.PNFT_OCAT_SWAP_FEE] = 8; // 0.8% 
        fees[FeeType.OCAT_PNFT_SWAP_FEE] = 8; // 0.8%
    }

    modifier onlyValidCaller virtual {
        require(msg.sender != address(0), "Expected non-zero address of caller");
        _;
    }
    function _compareStrings(string memory a, string memory b) internal pure returns (bool) {
        return (keccak256(abi.encodePacked((a))) == keccak256(abi.encodePacked((b))));
    }
    function setOcatAddress(address payable _ocatAddress) public 
    onlyCreator onlyValidAddress(_ocatAddress) onlyAdmin {
        ocatAddress = _ocatAddress;
    }
    function getOcatPrice() public view returns(uint256 value, uint256 decimals) { 
        value = ocatPrice;
        decimals = OCAT_PRICE_DECIMALS;
    }
    function setOcatPrice(uint256 _price) public 
    onlyAdmin {
        require(_price > 0, "Invalid price");
        ocatPrice = _price;
    }
    function convertToOcat(uint256 price) public returns(uint256 _ocatPrice) {
        _ocatPrice = (price * (10 ** IOcat(ocatAddress).decimals()) * ocatPrice) / 
                    (10 ** OCAT_PRICE_DECIMALS);
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
        require(feeType > FeeType.PNFT_MINT_FEE && 
                feeType <= FeeType.FEE_TYPE_SIZE, "Invalid fee type"); 
        return fees[feeType];
    }
    function setOcxAddress(address payable _ocxAddress) public 
    onlyCreator onlyValidAddress(_ocxAddress) {
        ocxAddress = _ocxAddress;
    }
    function setOcxPriceOracleAddress(address payable _ocxPriceOracleAddress) public 
    onlyCreator onlyValidAddress(_ocxPriceOracleAddress) {
        ocxPriceOracleAddress = _ocxPriceOracleAddress;
    }
}
