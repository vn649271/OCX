// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./OcxAdmin.sol";

contract OcxToken is ERC20, OcxAdmin {

    uint8           private _decimals;

    receive() external payable {}

    constructor() ERC20("Liquidity Provider Coin for OpenchainDex Local Pool", "OCX") {
        _decimals = 9; // In nano
    }

    function mint(uint256 amount) external payable 
    onlyAdmin returns(bool) {
        super._mint(msg.sender, amount);
        return true;
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
    /**
    * Custom accessor to create a unique token
    */
}
