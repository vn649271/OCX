// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import './OcxBase.sol';

contract OcxLocalPoolBase is OcxBase {

    uint256 private constant QUOTE_DECIMALS = 6; // Must be more than 3 at least
    address private constant WETH = 0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6;

    address payable private ocatAddress;
    address payable private creator;

    struct Pool {
        address[2] tokenPair;
        mapping(address payable => uint256) amounts;
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


    mapping(uint => Pool)   poolList;
    uint                    poolCount;
    // mapping(address => PoolShare[]) public poolShare;

    receive() external payable {}

    constructor() {
        creator = payable(msg.sender);
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
     *      -1: OcxLocalPoolBase.swap(): Invalid ETH amount
     *      -2: OcxLocalPoolBase.swap(): No pool for ETH-OCAT
     *      -3: OcxLocalPoolBase.swap(): No balance for OCAT in the pool
     *      -4: OcxLocalPoolBase.swap(): Insufficient balance for OCAT in the pool(1)
     *      -5: OcxLocalPoolBase.swap(): Insufficient balance for OCAT in the pool(2)
     *      -6: OcxLocalPoolBase.swap(): Insufficient balance for OCAT in the pool(3)
     *      -7: OcxLocalPoolBase.swap(): Insufficient allowance
     */
    function swap(
                address[2] path,
                uint amountIn, 
                uint _amountOutMin, 
                uint _deadline) 
                public payable 
    onlyValidAddress(path[0]) onlyValidAddress(path[1]) {
        require(amountIn > 0, "-1");
        // Find the ETH/OCAT pool
        (bool bFound, uint8 poolIndex, bool isInTurn) = _getPoolIndex(path);
        // Check if the pool exists
        require(bFound, "-2");
        // Get ETH balance in the pool
        uint firstTokenAddress = isInTurn?path[0]:path[1];
        uint secondTokenAddress = isInTurn?path[1]:path[0];
        uint256 token0Balance = poolList[poolIndex].amounts[firstTokenAddress];
        uint256 token1Balance = poolList[poolIndex].amounts[secondTokenAddress];
        // Ensure that OCAT balance is more than 0
        require(_amountOutMin >= 0, "-3");
        // Ensure that OCAT balance >= _amountOutMin
        require(token1Balance > _amountOutMin, "-4");
        // Calculate the output amount of OCAT 
        uint256 token1NewBalance = poolList[poolIndex].k / (token0Balance + amountIn);
        require(token1Balance >= token1NewBalance, "-5");
        uint256 amountOut = token1Balance - token1NewBalance;
        require(amountOut >= _amountOutMin, "-6");

        // Transfer ETH from the sender
        // First check allowance of ETH amount from the sender
        uint256 allowance = IERC20(path[0]).allowance(to, address(this));
        require(allowance >= _amountIn, "-7");
        // Transfer ETH from the sender
        TransferHelper.safeTransferFrom(path[0], msg.sender, address(this), _amountIn);
        // Transfer OCAT to the sender
        IERC20(path[1]).transfer(msg.sender, amountOut);

        // Update the quote for the pool
        poolList[poolIndex].amounts[firstTokenAddress] += amountIn;
        poolList[poolIndex].amounts[secondTokenAddress] -= amountOut;
        poolList[poolIndex].prevQuote = poolList[poolIndex].quote;

        poolList[poolIndex].quote = 
            (poolList[poolIndex].amounts[poolList[poolIndex].quoteOrder[0]] * (10 ** QUOTE_DECIMALS)) / 
                poolList[poolIndex].amounts[poolList[poolIndex].quoteOrder[1]];
    }

    function addLiquidity(
        address[2] memory tokenPair, 
        uint256[2] memory amounts
    ) public {
        require(msg.sender != address(0), "Invalid sender");
        require(tokenPair[0] != address(0) && tokenPair[1] != address(0), "Invalid tokenPair");
        require(tokenPair[0] != tokenPair[1], "Same tokenPair");
        require(amounts[0] > 0 && amounts[1] > 0, "Invalid amounts");
        // If the amount of OCAT is limited, then assert sender must be creator
        // Otherwise OCAT is mintable with swapping from/to PNFT continuosly,
        //   following assertion must be removed
        require(creator == msg.sender);

        // Get quote
        // ...uint256((quote / poolList[poolIndex].quoteOrig) * 100)
        // Transfer token A and B from msg.sender to this address

        bool bExist = false;
        bool isInTurn = true;
        uint8 poolIndex = 0;
        uint256 quoteMultiplier = 10 ** QUOTE_DECIMALS;

        (bExist, poolIndex, isInTurn) = _getPoolIndex(tokenPair[0], tokenPair[1]);
        if (!bExist) {
            address[2] memory quoteOrder = tokenPair;
            if (amounts[0] < amounts[1]) {
                quoteOrder = [tokenPair[1], tokenPair[0]];
            }
            poolList[poolCount] = Pool(
                {
                    tokenPair: tokenPair,
                    amounts: amounts, 
                    k: amounts[0] * amounts[1],
                    prevK: 0,
                    quoteOrder: quoteOrder,
                    quoteOrig: uint256((amounts[quoteOrder[0]] * quoteMultiplier) / amounts[quoteOrder[1]]),
                    quote: uint256((amounts[quoteOrder[0]] * quoteMultiplier) / amounts[quoteOrder[1]]),
                    prevQuote: 0
                }
            );
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
                (amounts[poolList[poolIndex].quoteOrder[0]] * quoteMultiplier) / 
                amounts[poolList[poolIndex].quoteOrder[1]]
            );
            uint256 quoteRate = uint256((quote * quoteMultiplier) / poolList[poolIndex].quoteOrig);
            // Check if new quote >= 98% and <= 102%
            require(
                quoteRate > 980 * (10 ** (QUOTE_DECIMALS - 3)) && 
                    quoteRate < 1020 * (10 ** (QUOTE_DECIMALS - 3)), 
                "Invalid quote"
            );
            // Update pool
            Pool memory pool = poolList[poolIndex];
            pool.amounts[0] += amounts[0];
            pool.amounts[1] += amounts[1];
            pool.prevK = pool.k;
            pool.k = pool.amounts[0] * pool.amounts[1];
            pool.prevQuote = pool.quote;
            pool.quote = uint256(
                (pool.amounts[poolList[poolIndex].quoteOrder[0]] * quoteMultiplier) / 
                pool.amounts[poolList[poolIndex].quoteOrder[1]]
            );
            poolList[poolIndex] = pool;
        }
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
