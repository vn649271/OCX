// SPDX-License-Identifier: MIT
pragma solidity >= 0.6.2;

// https://soliditydeveloper.com/uniswap2
// https://docs.uniswap.org/protocol/V2/guides/smart-contract-integration/trading-from-a-smart-contract

import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";

contract OpenchainContract {

    address private constant UNISWAP_ROUTER_ADDRESS =
        0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
    IUniswapV2Router02 public uniswapRouter;
    // address private constant WETH = 
    //     0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6; 
        // 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    constructor() {
        uniswapRouter = IUniswapV2Router02(UNISWAP_ROUTER_ADDRESS);
    }

    function swapETH(
        address _tokenOut,
        uint _amountOutMin,
        address _to,
        uint _deadline
    ) public payable {
        // uint deadline = block.timestamp + 15; // using 'now' for convenience, for mainnet pass deadline from frontend!
        address[] memory path = new address[](2);
        path[0] = uniswapRouter.WETH();
        path[1] = address(_tokenOut);
        uniswapRouter.swapExactETHForTokens{value: msg.value}(_amountOutMin, path, _to, _deadline);
    }
}
