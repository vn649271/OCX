// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/*
 * OCAT/ETH local pool
 */
import "@openzeppelin/contracts/token/ERC20/IERC20.sol"; // openzeppelin 4.5 (for solidity 0.8.x)
// import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import '@uniswap/lib/contracts/libraries/TransferHelper.sol';
import '../OcxBase.sol';

contract OcxOcatEthPool is OcxBase {

    struct Pool {
        address[2] tokenPair;
        mapping(address => uint256) balance;
        uint256 k;
        uint256 prevK;
        uint256 prevQuote;
        uint256 origQuote;
        uint256 quote;
    }
    Pool    public              localPool; // token pair: 0: OCAT, 1: ETH

    uint256 private constant    QUOTE_DECIMALS = 9; // Must be more than 3 at least
    uint256 private constant    QUOTE_MULTIPLIER = 10 ** QUOTE_DECIMALS;
    uint256 private constant    QUOTE_RATE_DECIMALS = 3; // Must be more than 3 at least
    uint256 private constant    QUOTE_RATE_MULTIPLIER = 10 ** QUOTE_RATE_DECIMALS;

    address private constant    ETH_ADDRESS = address(0);


    event SwappedFromOcat(uint256);
    event SwappedToOcat(uint256);
    
    receive() external payable {}

    constructor() {
    }

    // The method must be called after setOcatAddress()
    function init() external {
        localPool.tokenPair = [ocatAddress, address(0)];
    }

    function getAmountsOut(
        uint256 sellAmount, 
        string[2] memory path
    ) public view returns(uint256 amountOut) {
        bool ret1 = _compareStrings(path[0], "OCAT");
        bool ret2 = _compareStrings(path[1], "ETH");
        bool ret3 = _compareStrings(path[0], "ETH");
        bool ret4 = _compareStrings(path[1], "OCAT");
        require(ret1 && ret2 || ret3 && ret4, "getAmountsOut(): Invalid path");

        // Find the ETH/OCAT pool
        uint256 ocatPoolBalance = localPool.balance[ocatAddress];
        uint256 ethPoolBalance = localPool.balance[ETH_ADDRESS];

        if (ret1 && ret2) {
            // Calculate the output amount of OCAT 
            uint256 newOcatPoolBalance = localPool.k / (ocatPoolBalance + sellAmount);
            require(ethPoolBalance > newOcatPoolBalance, "getAmountsOut(): Insufficient ETH balance in the pool");
            amountOut = ethPoolBalance - newOcatPoolBalance;
        } else {
            // Calculate the output amount of OCAT 
            uint256 newPoolEthBalance = (localPool.k / (ethPoolBalance + sellAmount));
            require(ocatPoolBalance > newPoolEthBalance, "getAmountsOut(): Insufficient ETH balance in the pool");
            amountOut = ocatPoolBalance - newPoolEthBalance;            
        }
    }

    function swapToOcat(uint256 amountIn, uint256 amountOutMin, uint /*_deadline*/)  public payable
    onlyAdmin returns(uint256 amountOut)
    {
        amountOut = getAmountsOut(amountIn, ["ETH", "OCAT"]);
        require(amountOut >= amountOutMin, "Insufficient OCAT balance for your swap");

        // Transfer OCAT to the sender
        TransferHelper.safeTransfer(ocatAddress, msg.sender, amountOut);

        // Update the quote for the pool
        localPool.balance[address(0)] += amountIn;
        localPool.balance[ocatAddress] -= amountOut;
        localPool.prevQuote = localPool.quote;
        localPool.quote = localPool.balance[ocatAddress] / 
                            (localPool.balance[address(0)] / QUOTE_MULTIPLIER);
        // require(ret, "new ETH balance in the pool is overflowed");
        emit SwappedToOcat(amountOut);
    }

    function swapFromOcat(uint256 amountIn, uint256 amountOutMin, uint /*_deadline*/)  public payable
    onlyAdmin returns(uint256 amountOut)
    {
        amountOut = getAmountsOut(amountIn, ["OCAT", "ETH"]);
        require(amountOut >= amountOutMin, "Insufficient ETH balance for your swap");

        // Transfer source token from the sender
        uint256 allowance = IERC20(ocatAddress).allowance(msg.sender, address(this));
        require(allowance >= amountIn, "OcxOcatEthPool.swapFromOcat(): Insufficient allowance for OCAT");
        TransferHelper.safeTransferFrom(ocatAddress, msg.sender, address(this), amountIn);

        // Transfer target to the sender
        payable(msg.sender).transfer(amountOut);

        // Update the quote for the pool
        localPool.balance[ocatAddress] += amountIn;
        localPool.balance[address(0)] -= amountOut;
        localPool.prevQuote = localPool.quote;
        localPool.quote = localPool.balance[ocatAddress] / 
                            (localPool.balance[address(0)] / QUOTE_MULTIPLIER);
        // require(ret, "new ETH balance in the pool is overflowed");
        emit SwappedFromOcat(amountOut);
    }

    /*
     * Parameters:
     *      ocatAmount: amount of OCAT
     *      msg.value: amount of ETH
     */
    function addLiquidityWithEth(
        uint256 ocatAmount
    ) public payable 
    onlyAdmin onlyValidAddress(ocatAddress) {
        require(ocatAmount > 0, "Invalid OCAT amount");
        // Get quote
        // ...uint256((quote / localPool.origQuote) * 100)
        // Transfer token A and B from msg.sender to this address

        // Check quote
        uint256 newQuote = uint256(ocatAmount / (msg.value / QUOTE_MULTIPLIER));
        uint256 quoteRate = QUOTE_RATE_MULTIPLIER; // = 1 * QUOTE_RATE_MULTIPLIER ==> rate = 1.0
        if (localPool.origQuote == 0) {
            localPool.origQuote = newQuote;
        } else {
            quoteRate = uint256((newQuote * QUOTE_RATE_MULTIPLIER) / localPool.origQuote);
        }
        // Check if new quote >= 98% and <= 102% against original one
        require(
            quoteRate > 980 && 
            quoteRate < 1020, 
            "Invalid quote(out of effective range: 98%~102%)"
        );
        // Update pool
        localPool.balance[ocatAddress] += ocatAmount;
        localPool.balance[ETH_ADDRESS] += msg.value;
        localPool.prevK = localPool.k;
        localPool.k = localPool.balance[ocatAddress] * 
                    localPool.balance[ETH_ADDRESS];
        localPool.prevQuote = localPool.quote;
        localPool.quote = newQuote;

        // Deposit OCAT, first token.
        uint256 allowance = IERC20(ocatAddress).allowance(msg.sender, address(this));
        require(allowance >= ocatAmount, "OcxOcatEthPool.addLiquidity(): Insufficient allowance for OCAT");
        TransferHelper.safeTransferFrom(ocatAddress, msg.sender, address(this), ocatAmount);
        // For ETH, second token, No need deposit

        // Mint LP token to return
        // ...
        // uint256 newMintAmount = ocatAmount * msg.value;
        // IERC20(_ETH_ADDRESS).mint(newMintAmount);
        // // Send the msg.value with fee substracted
        // IERC20(_ETH_ADDRESS).transfer(msg.sender, (newMintAmount * 100 - 2) / 100)
    }
}