// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// https://soliditydeveloper.com/uniswap2
// https://docs.uniswap.org/protocol/V2/guides/smart-contract-integration/trading-from-a-smart-contract
// https://ethereum.org/ru/developers/tutorials/transfers-and-approval-of-erc-20-tokens-from-a-solidity-smart-contract/
// https://solidity-by-example.org/app/erc20/

import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@uniswap/v3-periphery/contracts/interfaces/IQuoter.sol";
// import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import '@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol';
import "@openzeppelin/contracts/token/ERC20/IERC20.sol"; // openzeppelin 4.5 (for solidity 0.8.x)
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "./OcxBase.sol";
import "./PawnNFTs.sol";
import "./OcatToken.sol";
import "./common/OcxCommon.sol";

contract OcxExchange is OcxBase {

    // IUniswapV2Router02  public uniswapRouter;
    ISwapRouter public constant uniswapRouter = ISwapRouter(UNISWAP_V3_ROUTER_ADDRESS);
    IQuoter public constant quoter = IQuoter(UNISWAP_V3_QUOTER_ADDRESS);
    // address payable private ocxLocalPoolAddress;

    event estimatedOcxAmountForBurningOcat(uint256);

    receive() external payable {}

    constructor() {
        // uniswapRouter = IUniswapV2Router02(UNISWAP_V3_ROUTER_ADDRESS);
    }

    // function setOcxLocalPoolAddress(address payable _ocxLocalPoolAddress) public 
    // onlyCreator onlyValidAddress(_ocxLocalPoolAddress) {
    //     ocxLocalPoolAddress = _ocxLocalPoolAddress;
    // }

    function swap(
        address _tokenIn,
        uint _amountIn,
        address _tokenOut,
        uint _amountOutMin,
        uint _deadline
    ) public 
    returns(uint amountOut) {
        // transferFrom
        //    Check for allowance
        if (_tokenIn != contractAddress[CommonContracts.WETH]) {
            uint256 allowance = IERC20(_tokenIn).allowance(msg.sender, address(this));
            require(allowance >= _amountIn, "Insufficient allowance");
            //     Do transferFrom
            // approve
            require(
                IERC20(_tokenIn).approve(address(UNISWAP_V3_ROUTER_ADDRESS), _amountIn), 
                'OcxExchange.swap(): approve for the router failed.'
            );
        }
        TransferHelper.safeTransferFrom(_tokenIn, msg.sender, address(this), _amountIn);

        ISwapRouter.ExactInputSingleParams memory params =
            ISwapRouter.ExactInputSingleParams({
                tokenIn: contractAddress[CommonContracts.WETH],
                tokenOut: _tokenOut,
                fee: POOL_FEE,
                recipient: msg.sender,
                deadline: block.timestamp + 15,
                amountIn: _amountIn,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            });

        // The call to `exactInputSingle` executes the swap.
        amountOut = uniswapRouter.exactInputSingle(params);
    }
    /**
     *  Mint OCAT by funding ETH
     */
    function mintOcat() public payable 
    onlyAdmin onlyValidAddress(contractAddress[CommonContracts.PRICE_ORACLE]) 
    onlyValidAddress(contractAddress[CommonContracts.OCAT]) {
        OcxPrice memory ethAudPriceInfo = IOcxPriceOracle(
            contractAddress[CommonContracts.PRICE_ORACLE]
        ).getCurrencyRatio(CurrencyIndex.OCAT, CurrencyIndex.OCX);
        uint8 ocatDecimals = IOcat(contractAddress[CommonContracts.OCAT]).decimals();
        mintOcat(
            (msg.value * ethAudPriceInfo.value * (10**ocatDecimals)) / 
            ((10**18) * ethAudPriceInfo.decimals)
        );
    }
    /**
     * Mint OCAT as specified amount
     */
    function mintOcat(uint256 amount) internal onlyAdmin {
        IOcxERC20(contractAddress[CommonContracts.OCAT]).mint(amount);
        swap(
            contractAddress[CommonContracts.OCAT], amount, 
            contractAddress[CommonContracts.OCX], 0, 
            block.timestamp
        );
    }
    function _getEstimatedOcxforOcat(uint ocatAmount) internal returns (uint256) {
        address tokenIn = contractAddress[CommonContracts.OCX];
        address tokenOut = contractAddress[CommonContracts.OCAT];
        uint24 fee = 3000;
        uint160 sqrtPriceLimitX96 = 0;

        // getQuoteAtTick()
        return quoter.quoteExactOutputSingle(
            tokenIn,
            tokenOut,
            fee,
            ocatAmount,
            sqrtPriceLimitX96
        );
    }
    function burnOcat(uint256 amount) internal onlyAdmin {
        uint256 ocxAmount = _getEstimatedOcxforOcat(amount);
        emit estimatedOcxAmountForBurningOcat(ocxAmount);
        IERC20(contractAddress[CommonContracts.OCX]).approve(UNISWAP_V3_ROUTER_ADDRESS, ocxAmount);
        swap(
            contractAddress[CommonContracts.OCX], ocxAmount, 
            contractAddress[CommonContracts.OCAT], 0, 
            block.timestamp
        );
        IOcxERC20(contractAddress[CommonContracts.OCAT]).burn(amount);
    }
    function mintOcx(uint256 amount) public payable onlyAdmin  {
        IOcxERC20(contractAddress[CommonContracts.OCX]).mint(amount);
    }
    function burnOcx(uint256 amount) internal onlyAdmin {
        IOcxERC20(contractAddress[CommonContracts.OCX]).burn(amount);
    }
}
