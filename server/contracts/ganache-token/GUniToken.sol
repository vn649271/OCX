// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract GUniToken is ERC20 {

    receive() external payable {}

    constructor() ERC20("Ganache UNI Coin", "GUNI") {
        super._mint(msg.sender, (10 ** 8) * (10 ** 18));
    }
}
