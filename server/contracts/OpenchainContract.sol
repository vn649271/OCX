// SPDX-License-Identifier: MIT
pragma solidity >= 0.6.2;

// https://soliditydeveloper.com/uniswap2
// https://docs.uniswap.org/protocol/V2/guides/smart-contract-integration/trading-from-a-smart-contract
// https://ethereum.org/ru/developers/tutorials/transfers-and-approval-of-erc-20-tokens-from-a-solidity-smart-contract/
// https://solidity-by-example.org/app/erc20/

import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import '@uniswap/lib/contracts/libraries/TransferHelper.sol';
import "@openzeppelin/contracts/token/ERC20/IERC20.sol"; // openzeppelin 4.5 (for solidity 0.8.x)
import "@openzeppelin/contracts/utils/Strings.sol";

contract OpenchainContract {

    address private constant UNISWAP_ROUTER_ADDRESS =
        0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
    IUniswapV2Router02 public uniswapRouter;

    function strConcat(string memory _a, string memory _b, string memory _c, string memory _d, string memory _e) internal returns (string memory){
        bytes memory _ba = bytes(_a);
        bytes memory _bb = bytes(_b);
        bytes memory _bc = bytes(_c);
        bytes memory _bd = bytes(_d);
        bytes memory _be = bytes(_e);
        string memory abcde = new string(_ba.length + _bb.length + _bc.length + _bd.length + _be.length);
        bytes memory babcde = bytes(abcde);

        uint i = 0;
        uint k = 0;

        for (i = 0; i < _ba.length; i++) babcde[k++] = _ba[i];
        for (i = 0; i < _bb.length; i++) babcde[k++] = _bb[i];
        for (i = 0; i < _bc.length; i++) babcde[k++] = _bc[i];
        for (i = 0; i < _bd.length; i++) babcde[k++] = _bd[i];
        for (i = 0; i < _be.length; i++) babcde[k++] = _be[i];
        return string(babcde);
    }

    function strConcat(string memory _a, string memory _b, string memory _c, string memory _d) internal returns (string memory) {
        return strConcat(_a, _b, _c, _d, "");
    }

    function strConcat(string memory _a, string memory _b, string memory _c) internal returns (string memory) {
        return strConcat(_a, _b, _c, "", "");
    }

    function strConcat(string memory _a, string memory _b) internal returns (string memory) {
        return strConcat(_a, _b, "", "", "");
    }

    constructor() {
        uniswapRouter = IUniswapV2Router02(UNISWAP_ROUTER_ADDRESS);
    }

    receive() external payable {}

    function swapFromETH(
        address _tokenOut,
        uint _amountOutMin,
        uint _deadline
    ) public payable {
        // uint deadline = block.timestamp + 15; // using 'now' for convenience, for mainnet pass deadline from frontend!
        address[] memory path = new address[](2);
        path[0] = uniswapRouter.WETH();
        path[1] = address(_tokenOut);
        uniswapRouter.swapExactETHForTokens{value: msg.value}(_amountOutMin, path, msg.sender, _deadline);
    }

    function swapToETH(
        address _tokenIn,
        uint _amountIn,
        uint _amountOutMin,
        uint _deadline
    ) public {
        // transferFrom
        IERC20 sellTokenContract = IERC20(_tokenIn);
        //     Check for allowance
        uint256 allowance = sellTokenContract.allowance(msg.sender, address(this));
        string memory errorText = Strings.toString(allowance);
        errorText = strConcat("Not enough allowance for the ERC20 token. allowance: ", errorText);
        require(allowance >= _amountIn, errorText);
        //     Do transferFrom
        TransferHelper.safeTransferFrom(_tokenIn, msg.sender, address(this), _amountIn);

        // approve
        require(sellTokenContract.approve(address(UNISWAP_ROUTER_ADDRESS), _amountIn), 'approve for the router failed.');

        address[] memory path = new address[](2);
        path[0] = address(_tokenIn);
        path[1] = uniswapRouter.WETH();
        uniswapRouter.swapExactTokensForETH(_amountIn, _amountOutMin, path, msg.sender, _deadline);
    }

    function swapForERC20(
        address _tokenIn,
        uint _amountIn,
        address _tokenOut,
        uint _amountOutMin,
        uint _deadline
    ) public {
        // transferFrom
        //    Check for allowance
        uint256 allowance = IERC20(_tokenIn).allowance(msg.sender, address(this));
        string memory errorText = Strings.toString(allowance);
        errorText = strConcat("Not enough allowance for the ERC20 token. allowance: ", errorText);
        require(allowance >= _amountIn, errorText);
        //     Do transferFrom
        TransferHelper.safeTransferFrom(_tokenIn, msg.sender, address(this), _amountIn);

        // approve
        require(
            IERC20(_tokenIn).approve(address(UNISWAP_ROUTER_ADDRESS), _amountIn), 
            'approve for the router failed.'
        );

        address[] memory path = new address[](3);
        path[0] = _tokenIn;
        path[1] = uniswapRouter.WETH();
        path[2] = _tokenOut;
        uniswapRouter.swapExactTokensForTokens(_amountIn, _amountOutMin, path, msg.sender, _deadline);
    }
}
