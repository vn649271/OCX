// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./OcxAdmin.sol";

contract OcatToken is ERC20, OcxAdmin {

    uint8           private _decimals;

    receive() external payable {}

    constructor() ERC20("OpenchainDex Stable Coin", "OCAT") {
        _decimals = 9; // In nano
    }

    /**
        * Custom accessor to create a unique token
    */
    function mint(uint256 amount) external payable
    onlyAdmin returns(bool) {
        super._mint(msg.sender, amount);
        return true;
    }
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
}
