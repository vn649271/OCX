// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./OcxCommon.sol";

contract OcxFeeManager {

    struct OcxFee {
        mapping(uint8 => uint8) fees;
    }

    address payable private creator;
    address[]       private allowedOperators;
    mapping(address => OcxFee) private contractFee;

    receive() external payable {}

    modifier onlyValidAddress(address _address) {
        require(_address != address(0), "Caller have not to have zero address");
        _;
    }

    modifier onlyCreator {
        require(msg.sender != creator, "Caller have not to have zero address");
        _;
    }

    modifier callerMustBeAllowed {
        bool isAllowed = false;
        for (uint8 i = 0; i < allowedOperators.length; i++) {
            if (msg.sender == allowedOperators[i]) {
                isAllowed = true;
                break;
            }
        }
        require(isAllowed, "Not allowed user");
        _;
    }

    constructor() onlyValidAddress(msg.sender) {
        creator = payable(msg.sender);
    }

    function addOperator(address _address) public payable 
    onlyCreator onlyValidAddress(_address) {
        for (uint8 i = 0; i < allowedOperators.length; i++) {
            if (_address == allowedOperators[i]) {
                return;
            }
        }
        allowedOperators.push(_address);
    }

    function setContractFee(address contractAddress, uint8 feeType, uint8 feeValue) public 
    onlyValidAddress(contractAddress) callerMustBeAllowed {
        contractFee[contractAddress].fees[feeType] = feeValue;
    }
}
