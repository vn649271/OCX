// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol"; // openzeppelin 4.5 (for solidity 0.8.x)
import '@uniswap/lib/contracts/libraries/TransferHelper.sol';
import './OcxBase.sol';

contract OcxLocalPool is OcxBase {

    struct Pool {
        address[2] tokenPair;
        mapping(address => uint256) amounts;
        uint256 k;
        uint256 prevK;
        address[2] quoteOrder;
        uint256 prevQuote;
        uint256 quoteOrig;
        uint256 quote;
    }

    // struct PoolShare {
    //     uint8 poolIndex;
    //     uint256[2] amounts;
    // }

    mapping(uint256 => Pool)    poolList;
    uint256                     poolCount;
    // mapping(address => PoolShare[]) public poolShare;

    uint256 private constant QUOTE_DECIMALS = 6; // Must be more than 3 at least
    uint256 private constant QUOTE_MULTIPLIER = 10 ** QUOTE_DECIMALS;
    
    receive() external payable {}

    constructor() {
    }

    function _getPoolIndex(address[2] memory tokenPair) 
    internal view 
    returns (bool bFound, uint8 poolIndex, bool isInTurn)  {
        bFound = false;
        poolIndex = 0;
        isInTurn = true;
        for (uint8 i = 0; i < poolCount; i++) {
            if ((poolList[i].tokenPair[0] == tokenPair[0] && poolList[i].tokenPair[1] == tokenPair[1]) 
            || (poolList[i].tokenPair[1] == tokenPair[0] && poolList[i].tokenPair[0] == tokenPair[1])) {
                bFound = true;
                poolIndex = i;
                if (poolList[i].tokenPair[1] == tokenPair[0]) {
                    isInTurn = false;
                }
                break;
            }
        }
    }

    /*
     * Error: 
     *      -1: OcxLocalPool.swap(): Invalid ETH amount
     *      -2: OcxLocalPool.swap(): No pool for ETH-OCAT
     *      -3: OcxLocalPool.swap(): No balance for OCAT in the pool
     *      -4: OcxLocalPool.swap(): Insufficient balance for output of path[1]
     *      -5: OcxLocalPool.swap(): Insufficient allowance for path[0]
     */
    function swap(
                address[2] memory path,
                uint256 amountIn, 
                uint256 amountOutMin, 
                uint256 ) 
    public payable 
    onlyValidAddress(path[0]) onlyValidAddress(path[1]) {
        require(amountIn > 0, "-1");
        // Find the ETH/OCAT pool
        (bool bFound, uint8 poolIndex, ) = _getPoolIndex(path);
        // Check if the pool exists
        require(bFound, "-2");
        // Get ETH balance in the pool
        // Ensure that OCAT balance is more than 0
        require(amountOutMin >= 0, "-3");
        // Calculate the output amount of OCAT 
        uint256 token1NewBalance = poolList[poolIndex].k / 
                                    (poolList[poolIndex].amounts[path[0]] + amountIn);
        // Ensure that OCAT balance >= amountOutMin
        uint256 amountOut = poolList[poolIndex].amounts[path[1]] - token1NewBalance;
        require(amountOut >= amountOutMin, "-4");

        // Transfer ETH from the sender
        // First check allowance of ETH amount from the sender
        uint256 allowance = IERC20(path[0]).allowance(msg.sender, address(this));
        require(allowance >= amountIn, "-5");
        // Transfer ETH from the sender
        TransferHelper.safeTransferFrom(path[0], msg.sender, address(this), amountIn);
        // // Transfer OCAT to the sender
        IERC20(path[1]).transfer(msg.sender, amountOut);

        // Update the quote for the pool
        poolList[poolIndex].amounts[path[0]] += amountIn;
        poolList[poolIndex].amounts[path[1]] -= amountOut;
        poolList[poolIndex].prevQuote = poolList[poolIndex].quote;
        poolList[poolIndex].quote = 
            (poolList[poolIndex].amounts[poolList[poolIndex].quoteOrder[0]] * 
                                                        (10 ** QUOTE_DECIMALS)) / 
            poolList[poolIndex].amounts[poolList[poolIndex].quoteOrder[1]];
    }

    function getQuote(address[2] memory path) public view
    returns (uint256 value, uint256 decimals) {
        (bool bExist, uint8 poolIndex, bool isInTurn) = _getPoolIndex(path);
        require(bExist, "Not exist such a token pair");
        value = poolList[poolIndex].quote;
        if (!isInTurn) {
            value = (QUOTE_MULTIPLIER ** 2) / poolList[poolIndex].quote;
        }
        decimals = QUOTE_DECIMALS;
    }

    function getAmountOut(address[2] memory path, uint256 amountIn) public view
    returns (uint256 amountOut) {
        (bool bExist, uint8 poolIndex, bool isInTurn) = _getPoolIndex(path);
        require(bExist, "Not exist such a token pair");
        amountOut = poolList[poolIndex].amounts[path[1]] - 
                poolList[poolIndex].k / (poolList[poolIndex].amounts[path[0]] + amountIn);
    }

    /*
     * Error: 
     *      -1: OcxLocalPool.addLiquidity(): Same tokenPair
     *      -2: OcxLocalPool.addLiquidity(): Invalid amount for first token
     *      -3: OcxLocalPool.addLiquidity(): Invalid amount for second token
     *      -4: OcxLocalPool.addLiquidity(): Invalid quote
     *      -5: OcxLocalPool.swap(): Insufficient allowance for first token
     *      -6: OcxLocalPool.swap(): Insufficient allowance for second token
     */
    function addLiquidity(
        address[2] memory tokenPair, 
        uint256[2] memory amounts
    ) public 
    onlyCreator onlyValidCaller onlyValidAddress(tokenPair[0]) onlyValidAddress(tokenPair[1]) {

        require(tokenPair[0] != tokenPair[1], "-1");
        require(amounts[0] > 0, "-2");
        require(amounts[1] > 0, "-3");

        (bool bExist, uint8 poolIndex, bool isInTurn) = _getPoolIndex(tokenPair);
        if (!bExist) {
            address[2] memory quoteOrder = tokenPair;
            if (amounts[0] < amounts[1]) {
                quoteOrder = [tokenPair[1], tokenPair[0]];
            }
            poolList[poolCount].tokenPair = tokenPair;
            poolList[poolCount].amounts[tokenPair[0]] = amounts[0];
            poolList[poolCount].amounts[tokenPair[1]] = amounts[1];
            poolList[poolCount].k = amounts[0] * amounts[1];
            poolList[poolCount].prevK = 0;
            poolList[poolCount].quoteOrder = quoteOrder;
            poolList[poolCount].quoteOrig = 
                uint256(
                    (poolList[poolCount].amounts[quoteOrder[0]] * QUOTE_MULTIPLIER) / 
                    poolList[poolCount].amounts[quoteOrder[1]]
                );
            poolList[poolCount].quote = poolList[poolCount].quoteOrig;
            poolList[poolCount].prevQuote = 0;
            poolCount += 1;
        } else {
            // If order for token in parameter in against pool is revered, swap
            if (!isInTurn) {
                address tmpToken = tokenPair[0];
                tokenPair[0] = tokenPair[1];
                tokenPair[1] = tmpToken;
                uint256 tmpAmount = amounts[0];
                amounts[0] = amounts[1];
                amounts[1] = tmpAmount;
            }
            // Check quote
            uint256 quote = uint256(
                (poolList[poolIndex].amounts[poolList[poolIndex].quoteOrder[0]] * QUOTE_MULTIPLIER) / 
                poolList[poolIndex].amounts[poolList[poolIndex].quoteOrder[1]]
            );
            uint256 quoteRate = uint256((quote * QUOTE_MULTIPLIER) / poolList[poolIndex].quoteOrig);
            // Check if new quote >= 98% and <= 102%
            require(
                quoteRate > 980 * (10 ** (QUOTE_DECIMALS - 3)) && 
                    quoteRate < 1020 * (10 ** (QUOTE_DECIMALS - 3)), 
                "-4"
            );
            // Update pool
            poolList[poolIndex].amounts[tokenPair[0]] += amounts[0];
            poolList[poolIndex].amounts[tokenPair[1]] += amounts[1];
            poolList[poolIndex].prevK = poolList[poolIndex].k;
            poolList[poolIndex].k = 
                poolList[poolIndex].amounts[tokenPair[0]] * 
                poolList[poolIndex].amounts[tokenPair[1]];
            poolList[poolIndex].prevQuote = poolList[poolIndex].quote;
            poolList[poolIndex].quote = uint256(
                (poolList[poolIndex].amounts[poolList[poolIndex].quoteOrder[0]] * QUOTE_MULTIPLIER) / 
                poolList[poolIndex].amounts[poolList[poolIndex].quoteOrder[1]]
            );
        }
        // Receive path[0] as amount
        uint256 allowance = IERC20(tokenPair[0]).allowance(msg.sender, address(this));
        require(allowance >= amounts[0], "-5");
        // Transfer path[0] from the sender
        TransferHelper.safeTransferFrom(tokenPair[0], msg.sender, address(this), amounts[0]);
        // Receive path[1] as amount
        allowance = IERC20(tokenPair[1]).allowance(msg.sender, address(this));
        require(allowance >= amounts[1], "-6");
        // Transfer path[1] from the sender
        TransferHelper.safeTransferFrom(tokenPair[1], msg.sender, address(this), amounts[1]);
        // // Update pool share
        // bExist = false;
        // for (uint i = 0; i < poolShare[msg.sender].length; i++) {
        //     if (poolIndex == poolShare[msg.sender][i].poolIndex) {
        //         poolShare[msg.sender][i].amounts[0] += amounts[0];
        //         poolShare[msg.sender][i].amounts[1] += amounts[1];
        //         bExist = true;
        //         break;
        //     }
        // }
        // if (!bExist) {
        //     poolShare[msg.sender].push(PoolShare(poolIndex, amounts));
        // }

        // Mint LP token to return
        // ...
        // Transfer ETH and OCAT amounts from the sender
        // ...
    }
}
