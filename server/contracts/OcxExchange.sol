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
    mapping(CurrencyIndex => CurrencyPriceInfo) private quotes;


    event estimatedOcxAmountForBurningOcat(uint256);

    receive() external payable {}

    constructor() {
        // uniswapRouter = IUniswapV2Router02(UNISWAP_V3_ROUTER_ADDRESS);
    }

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
        address recipient = msg.sender;
        if (_tokenIn == contractAddress[CommonContracts.OCAT] 
         && _tokenOut == contractAddress[CommonContracts.UNI]) {
            uint256 ocxAmount = _amountIn * quotes[CurrencyIndex.OCAT].vs[CurrencyIndex.OCX].value;
            IERC20(contractAddress[CommonContracts.OCX]).approve(UNISWAP_V3_ROUTER_ADDRESS, ocxAmount);
            _tokenIn = contractAddress[CommonContracts.OCX];
            _amountIn = ocxAmount;
        } else if (_tokenIn == contractAddress[CommonContracts.UNI] 
                && _tokenOut == contractAddress[CommonContracts.OCAT]) {
            _tokenOut = contractAddress[CommonContracts.OCX];
            recipient = address(this);
        }

        ISwapRouter.ExactInputSingleParams memory params =
            ISwapRouter.ExactInputSingleParams({
                tokenIn: _tokenIn,
                tokenOut: _tokenOut,
                fee: POOL_FEE,
                recipient: recipient,
                deadline: block.timestamp + 15,
                amountIn: _amountIn,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            });

        // The call to `exactInputSingle` executes the swap.
        amountOut = uniswapRouter.exactInputSingle(params);

        if (_tokenIn == contractAddress[CommonContracts.UNI] 
        && _tokenOut == contractAddress[CommonContracts.OCAT]) {
            uint256 ocatAmount = amountOut / quotes[CurrencyIndex.OCAT].vs[CurrencyIndex.OCX].value;
            IERC20(contractAddress[CommonContracts.OCAT]).transfer(msg.sender, ocatAmount);
        }
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
        IERC20 ocat = IERC20(contractAddress[CommonContracts.OCAT]);
        if (ocat.balanceOf(address(this)) < amount) {
            uint256 ocxAmount = _getEstimatedOcxforOcat(amount);
            IERC20 ocx = IERC20(contractAddress[CommonContracts.OCX]);
            /*********************************************************
             * Warn to admin to deposit additional ETHs
             *********************************************************/
            require(ocx.balanceOf(address(this)) < ocxAmount, "1");
            //////////////////////////////////////////////////////////
            emit estimatedOcxAmountForBurningOcat(ocxAmount);
            IERC20(contractAddress[CommonContracts.OCX]).approve(UNISWAP_V3_ROUTER_ADDRESS, ocxAmount);
            swap(
                contractAddress[CommonContracts.OCX], ocxAmount, 
                contractAddress[CommonContracts.OCAT], 0, 
                block.timestamp
            );
        }
        IOcxERC20(contractAddress[CommonContracts.OCAT]).burn(amount);
    }
    function mintOcx(uint256 amount) public payable onlyAdmin  {
        IOcxERC20(contractAddress[CommonContracts.OCX]).mint(amount);
    }
    function burnOcx(uint256 amount) internal onlyAdmin {
        IOcxERC20(contractAddress[CommonContracts.OCX]).burn(amount);
    }
    function setQuote(CurrencyIndex left, CurrencyIndex right, OcxPrice memory newQuote) public {
        quotes[left].vs[right] = newQuote;
    }
    function getQuote(CurrencyIndex left, CurrencyIndex right) public view returns(OcxPrice memory) {
        return quotes[left].vs[right];
    }
}
