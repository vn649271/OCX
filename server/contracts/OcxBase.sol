// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./OcxAdmin.sol";
import "./common/OcxCommon.sol";
import './interface/IOcxBase.sol';
import './interface/IOcat.sol';

contract OcxBase is OcxAdmin, IOcxBase {

    uint256                     public ocatPrice;
    uint8                       constant OCAT_PRICE_DECIMALS = 3;
    /**
     * Available contract names: WETH, OCAT, OCX, PNFT, PRICE_ORACLE, BALANCER
     */
    mapping(CommonContracts => address) internal contractAddress;

    constructor() {
        ocatPrice = 1000;
    }

    modifier onlyValidCaller virtual {
        require(msg.sender != address(0), "Expected non-zero address of caller");
        _;
    }
    function _compareStrings(string memory a, string memory b) internal pure returns (bool) {
        return (keccak256(abi.encodePacked((a))) == keccak256(abi.encodePacked((b))));
    }
    function setCommonContractAddress(CommonContracts contractIndex, address payable _address) 
    public override
    onlyCreator onlyValidAddress(_address) onlyAdmin {
        require(contractIndex >= CommonContracts(0) && contractIndex < CommonContracts.CONRACT_COUNT, 
                "Invalid contract index");
        contractAddress[contractIndex] = _address;
    }
    function setOcatPrice(uint256 price) public override {
        ocatPrice = price;
    }
    function convertToOcat(uint256 price) public override returns(uint256 _ocatPrice) {
        _ocatPrice = (price * (10 ** IOcat(contractAddress[CommonContracts.OCAT]).decimals()) * ocatPrice) / 
                    (10 ** OCAT_PRICE_DECIMALS);
    }
}
