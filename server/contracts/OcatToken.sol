// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./interface/IOcxERC20.sol";
import "./OcxAdmin.sol";

contract OcatToken is ERC20, OcxAdmin {

    uint8           private _decimals;

    event minted(uint256 amount);
    event burned(uint256 amount);

    receive() external payable {}

    constructor() ERC20("OpenchainDex Stable Coin", "OCAT") {
        _decimals = 9; // In nano
    }

    /**
        * Custom accessor to create a unique token
    */
    function mint(uint256 amount) external payable
    onlyAdmin {
        super._mint(msg.sender, amount);
        emit minted(amount);
    }
    function burn(uint256 amount) public onlyAdmin {
        require(balanceOf(msg.sender) >= amount, "Insufficient OCAT balance to burn");
        super._burn(msg.sender, amount);
        emit burned(amount);
    }
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
}
