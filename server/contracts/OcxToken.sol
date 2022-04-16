// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract OcxToken is ERC20 {

    address payable private ocxPool;
    address payable private creator;
    uint8           private _decimals;

    receive() external payable {}

    constructor() ERC20("Liquidity Provider Coin for OpenchainDex Local Pool", "OCXLP") {
        creator = payable(msg.sender);
        _decimals = 3;
    }

    // function setOcxPoolAddress(address payable poolAddress) public {
    //     require(msg.sender == creator , "Invalid sender");
    //     ocxPool = poolAddress;
    // }

    function mint(address payable to, uint256 amount) public returns(bool) {
        require(msg.sender == ocxPool, "Invalid minter");
        super._mint(to, amount * (10 ** _decimals));
        return true;
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
    /**
    * Custom accessor to create a unique token
    */
}
