// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract OcatToken is ERC20 {

    address[]       private allowedOperators;
    address payable private creator;

    receive() external payable {}

    constructor() ERC20("OpenchainDex Stable Coin", "OCAT") {
        // super._mint(msg.sender, (10 ** 8) * (10 ** 18));
        creator = payable(msg.sender);
        allowedOperators.push(msg.sender);
    }


    modifier isAllowedOperator {
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

    function addOperator(address _address) public payable {
        require(_address == creator, "Invalid caller");
        for (uint8 i = 0; i < allowedOperators.length; i++) {
            if (_address == allowedOperators[i]) {
                return;
            }
        }
        allowedOperators.push(_address);
    }

    /**
        * Custom accessor to create a unique token
    */
    function mint(uint256 amount) public payable isAllowedOperator {
        super._mint(msg.sender, amount * (10 ** 18));
    }
}
