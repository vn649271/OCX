// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// https://soliditydeveloper.com/uniswap2
// https://docs.uniswap.org/protocol/V2/guides/smart-contract-integration/trading-from-a-smart-contract
// https://ethereum.org/ru/developers/tutorials/transfers-and-approval-of-erc-20-tokens-from-a-solidity-smart-contract/
// https://solidity-by-example.org/app/erc20/

import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import '@uniswap/lib/contracts/libraries/TransferHelper.sol';
import "@openzeppelin/contracts/token/ERC20/IERC20.sol"; // openzeppelin 4.5 (for solidity 0.8.x)
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "./OcxBase.sol";
import "./PawnNFTs.sol";
import "./OcatToken.sol";
import "./OcxLocalPool.sol";
import "./OcxCommon.sol";

contract OcxExchange is OcxBase {

    IUniswapV2Router02 public uniswapRouter;
    address payable private ocxLocalPoolAddress;

    receive() external payable {}

    constructor() {
        uniswapRouter = IUniswapV2Router02(UNISWAP_ROUTER_ADDRESS);
    }

    function setOcxLocalPoolAddress(address payable _ocxLocalPoolAddress) public 
    onlyCreator onlyValidAddress(_ocxLocalPoolAddress) {
        ocxLocalPoolAddress = _ocxLocalPoolAddress;
    }

    function swapFromETH(
        address _tokenOut,
        uint _amountOutMin,
        uint _deadline
    ) public payable {
        // uint deadline = block.timestamp + 15; // using 'now' for convenience, for mainnet pass deadline from frontend!
        address[] memory path = new address[](2);
        path[0] = uniswapRouter.WETH();
        path[1] = address(_tokenOut);
        // if (_tokenOut != ocatAddress) {
        uniswapRouter.swapExactETHForTokens(_amountOutMin, path, msg.sender, _deadline);
        // } else {
        //     OcxLocalPool(ocxLocalPoolAddress).swapEthToOcat{
        //         value: msg.value
        //     }(_amountOutMin, payable(msg.sender), _deadline);
        // }
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
        errorText = strConcat("OcxExchange.swapToETH(): Not enough allowance for the ERC20 token. allowance: ", errorText);
        require(allowance >= _amountIn, errorText);
        //     Do transferFrom
        TransferHelper.safeTransferFrom(_tokenIn, msg.sender, address(this), _amountIn);

        address[] memory path = new address[](2);
        path[0] = address(_tokenIn);
        path[1] = uniswapRouter.WETH();
        // if (_tokenIn != ocatAddress) {
            // approve
        require(
            sellTokenContract.approve(
                address(UNISWAP_ROUTER_ADDRESS), 
                _amountIn
            ), 
            'OcxExchange.swapToETH(): approve for the router failed.'
        );
        uniswapRouter.swapExactTokensForETH(
            _amountIn, 
            _amountOutMin, 
            path, 
            msg.sender, 
            _deadline
        );
        // } else {
        //     // approve
        //     require(
        //         sellTokenContract.approve(
        //             address(ocxLocalPoolAddress), 
        //             _amountIn
        //         ), 
        //         'OcxExchange.swapToETH(): approve for the router failed.'
        //     );
        //     OcxLocalPool(ocxLocalPoolAddress).swapOcatToEth(
        //         _amountIn,
        //         _amountOutMin, 
        //         payable(msg.sender), 
        //         _deadline
        //     );
        // }
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
        errorText = strConcat("OcxExchange.swapForERC20(): Not enough allowance for the ERC20 token. allowance: ", errorText);
        require(allowance >= _amountIn, errorText);
        //     Do transferFrom
        TransferHelper.safeTransferFrom(_tokenIn, msg.sender, address(this), _amountIn);

        // approve
        require(
            IERC20(_tokenIn).approve(address(UNISWAP_ROUTER_ADDRESS), _amountIn), 
            'OcxExchange.swapForERC20(): approve for the router failed.'
        );

        address[] memory path = new address[](3);
        path[0] = _tokenIn;
        path[1] = uniswapRouter.WETH();
        path[2] = _tokenOut;
        uniswapRouter.swapExactTokensForTokens(_amountIn, _amountOutMin, path, msg.sender, _deadline);
    }

}
