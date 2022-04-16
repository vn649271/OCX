// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./IOcat.sol";

contract OcatToken is ERC20, IOcat {

    address[]       private allowedOperators;
    address payable private creator;

    receive() external payable {}

    constructor() ERC20("OpenchainDex Stable Coin", "OCAT") {
        // super._mint(msg.sender, (10 ** 8) * (10 ** 18));
        creator = payable(msg.sender);
        allowedOperators.push(msg.sender);
    }

    modifier isAllowedOperator(address operator) override {
        bool isAllowed = false;
        for (uint8 i = 0; i < allowedOperators.length; i++) {
            if (operator == allowedOperators[i]) {
                isAllowed = true;
                break;
            }
        }
        require(isAllowed, "Not allowed user");
        _;
    }

    function addOperator(address operator) public payable override {
        require(msg.sender == creator, "Invalid caller");
        require(operator != address(0), "Invalid operator");
        
        for (uint8 i = 0; i < allowedOperators.length; i++) {
            if (operator == allowedOperators[i]) {
                return;
            }
        }
        allowedOperators.push(operator);
    }

    function getAllowedOperators() public view  override 
    returns(address[] memory) {
        return allowedOperators;
    }
    /**
        * Custom accessor to create a unique token
    */
    function mint(address from, uint256 amount) public override
    isAllowedOperator(from) {
        super._mint(from, amount * (10 ** decimals()));
    }
}
