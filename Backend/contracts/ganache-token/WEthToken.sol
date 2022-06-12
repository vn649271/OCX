// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract WEthToken is ERC20 {

    uint8   private _decimals;
    receive() external payable {}

    constructor() ERC20("Ganache WETH Coin", "WETH") {
        _decimals = 18; // In Wei
        super._mint(msg.sender, (10 ** 9) * (10 ** 18));
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
}
