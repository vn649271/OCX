// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol"; // openzeppelin 4.5 (for solidity 0.8.x)
import '@uniswap/lib/contracts/libraries/TransferHelper.sol';

contract OcxLocalPool {

    uint256 private constant QUOTE_DECIMALS = 3; // Must be more than 3 at least

    address payable private constant WETH = payable(address(0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6));
    address payable private wethAddress = WETH;
    address payable private ocatAddress;

    address payable private creator;

    struct Pool {
        address[2] tokens;
        mapping(address => uint256) amounts;
        uint256 k;
        uint256 prevK;
        address[2] quoteOrder;
        uint256 prevQuote;
        uint256 quoteOrig;
        uint256 quote;
    }

    struct SharingPool {
        uint8 index;
        mapping(address => uint256) sharingAmounts;
    }

    struct SharingPools {
        mapping(uint8 => SharingPool) pools;
        uint8                         poolCount;
    }

    mapping(uint8 => Pool) public   poolList;
    uint8 public                    poolCount;

    // mapping(address => PoolShare) public shares;
    mapping(address => SharingPools) public shares;

    event AmountToRetrieve(uint256);
    
    receive() external payable {}

    constructor() {
        creator = payable(msg.sender);
    }

    function setWethAddress(address payable _wethAddress) public {
        require(creator == msg.sender, "OcxLocalPool.setWethAddress(): Caller for  must be creator");
        require(_wethAddress != address(0), "OcxLocalPool.setWethAddress(): Invalid parameter");
        wethAddress = _wethAddress;
    }

    function setOcatAddress(address payable _ocatAddress) public {
        require(creator == msg.sender, "OcxLocalPool.setOcatAddress(): Caller for  must be creator");
        require(_ocatAddress != address(0), "OcxLocalPool.setOcatAddress(): Invalid parameter");
        ocatAddress = _ocatAddress;
    }

    function swapEthToOcat(uint _amountOutMin, address payable to, uint _deadline) public payable {
        require(to != address(0), "OcxLocalPool.swapEthToOcat(): Invalid sender");
        require(to != address(this), "OcxLocalPool.swapEthToOcat(): The sender must be different than this");
        require(msg.value > 0, "OcxLocalPool.swapEthToOcat(): Invalid ETH amount");
        // Find the ETH/OCAT pool
        (bool bFound, uint8 poolIndex, bool isInTurn) = _getPoolIndex(wethAddress, ocatAddress);
        // Check if the pool exists
        require(bFound, "OcxLocalPool.swapEthToOcat(): No pool for ETH/OCAT");
        // Get ETH balance in the pool
        uint256 ethPoolBalance = poolList[poolIndex].amounts[wethAddress];
        uint256 ocatPoolBalance = poolList[poolIndex].amounts[ocatAddress];
        // Ensure that OCAT balance is more than 0
        require(ocatPoolBalance > 0, "OcxLocalPool.swapEthToOcat(): No balance for OCAT in the pool");
        // Ensure that OCAT balance >= _amountOutMin
        require(ocatPoolBalance > _amountOutMin, "OcxLocalPool.swapEthToOcat(): Insufficient balance for OCAT in the pool(1)");
        // Calculate the output amount of OCAT 
        require(ocatPoolBalance >= (poolList[poolIndex].k / (ethPoolBalance + msg.value)), "OcxLocalPool.swapEthToOcat(): Insufficient balance for OCAT in the pool(2)");
        uint256 amountOut = ocatPoolBalance - (poolList[poolIndex].k / (ethPoolBalance + msg.value));
        require(amountOut > 0, "OcxLocalPool.swapEthToOcat(): Insufficient balance for OCAT in the pool(3)");
        require(amountOut >= _amountOutMin, "OcxLocalPool.swapEthToOcat(): Insufficient balance for OCAT in the pool(4)");

        // Transfer ETH from the sender
        // First check allowance of ETH amount from the sender
        uint256 allowance = IERC20(wethAddress).allowance(to, address(this));
        require(allowance >= msg.value, "");
        // Transfer ETH from the sender
        TransferHelper.safeTransferFrom(wethAddress, msg.sender, address(this), msg.value);
        // Transfer OCAT to the sender
        IERC20(ocatAddress).transfer(msg.sender, amountOut);

        // Update the quote for the pool
        poolList[poolIndex].amounts[wethAddress] += msg.value;
        poolList[poolIndex].amounts[ocatAddress] -= amountOut;
        poolList[poolIndex].prevQuote = poolList[poolIndex].quote;

        poolList[poolIndex].quote = 
            (poolList[poolIndex].amounts[wethAddress] * (10 ** QUOTE_DECIMALS)) / 
                poolList[poolIndex].amounts[ocatAddress];
    }

    function swapOcatToEth(
            uint _amountIn, 
            uint _amountOutMin, 
            address payable to, 
            uint _deadline
    ) public returns (uint256 amountOut) {
        require(to != address(0), "OcxLocalPool.swapOcatToEth(): Invalid sender");
        require(to != address(this), "OcxLocalPool.swapOcatToEth(): The sender must be different than this");
        require(_amountIn > 0, "OcxLocalPool.swapOcatToEth(): Invalid ETH amount");
        // Find the ETH/OCAT pool
        (bool bFound, uint8 poolIndex, bool isInTurn) = _getPoolIndex(ocatAddress, wethAddress);
        // Check if the pool exists
        require(bFound, "OcxLocalPool.swapOcatToEth(): No pool for ETH-OCAT");
        // Get ETH balance in the pool
        uint256 ethPoolBalance = poolList[poolIndex].amounts[wethAddress];
        uint256 ocatPoolBalance = poolList[poolIndex].amounts[ocatAddress];
        // Ensure that OCAT balance is more than 0
        require(ethPoolBalance > 0, "OcxLocalPool.swapOcatToEth(): No balance for ETH in the pool");
        // Ensure that OCAT balance >= _amountOutMin
        require(ethPoolBalance > _amountOutMin, "OcxLocalPool.swapOcatToEth(): Insufficient balance for ETH in the pool(1)");
        // Calculate the output amount of OCAT 
        uint256 requiredLeavedPoolEthBalance = (poolList[poolIndex].k / (ocatPoolBalance + _amountIn));
        require(ethPoolBalance >= requiredLeavedPoolEthBalance, "OcxLocalPool.swapOcatToEth(): Insufficient balance for ETH in the pool(2)");
        amountOut = ethPoolBalance - requiredLeavedPoolEthBalance;
        require(amountOut > 0, "OcxLocalPool.swapOcatToEth(): Insufficient balance for ETH in the pool(3)");
        require(amountOut >= _amountOutMin, "OcxLocalPool.swapOcatToEth(): Insufficient balance for ETH in the pool(4)");
        emit AmountToRetrieve(amountOut);
        // Transfer OCAT from the sender
        // First check allowance of OCAT amount from the sender
        uint256 allowance = IERC20(ocatAddress).allowance(to, address(this));
        require(allowance >= _amountIn, "OcxLocalPool.swapOcatToEth(): Insufficient allowed amount for input token");
        // Transfer OCAT from the sender
        TransferHelper.safeTransferFrom(ocatAddress, msg.sender, address(this), _amountIn);
        // Transfer ETH to the sender
        require(IERC20(wethAddress).approve(msg.sender, amountOut), 'OcxLocalPool.swapOcatToEth(): Failed to approve WETH for sender');
        emit AmountToRetrieve(amountOut);

        bool ret = IERC20(wethAddress).transfer(msg.sender, amountOut);
        require(ret, "OcxLocalPool.swapOcatToEth(): Failed to transfer ETH to sender");

        // Update the quote for the pool
        poolList[poolIndex].amounts[ocatAddress] += _amountIn;
        poolList[poolIndex].amounts[wethAddress] -= amountOut;
        poolList[poolIndex].prevQuote = poolList[poolIndex].quote;

        poolList[poolIndex].quote = 
            (poolList[poolIndex].amounts[poolList[poolIndex].quoteOrder[1]] * (10 ** QUOTE_DECIMALS)) / 
                poolList[poolIndex].amounts[poolList[poolIndex].quoteOrder[0]];
    }

    function _getPoolIndex(
        address token0,
        address token1
     ) internal view returns (bool bFound, uint8 poolIndex, bool isInTurn)  {
        bFound = false;
        poolIndex = 0;
        isInTurn = true;
        for (uint8 i = 0; i < poolCount; i++) {
            if ((poolList[i].tokens[0] == token0 && poolList[i].tokens[1] == token1) 
            || (poolList[i].tokens[1] == token0 && poolList[i].tokens[0] == token1)) {
                bFound = true;
                poolIndex = i;
                if (poolList[i].tokens[1] == token0) {
                    isInTurn = false;
                }
                break;
            }
        }
    }

    function addLiquidity(
        address[2] memory tokens, 
        uint256[2] memory amounts
    ) public {
        require(msg.sender != address(0), "Invalid sender");
        require(tokens[0] != address(0) && tokens[1] != address(0), "Invalid tokens");
        require(tokens[0] != tokens[1], "Same tokens");
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

        (bExist, poolIndex, isInTurn) = _getPoolIndex(tokens[0], tokens[1]);
        if (!bExist) {
            address[2] memory quoteOrder;
            quoteOrder[0] = tokens[0];
            quoteOrder[1] = tokens[1];

            if (amounts[0] > amounts[1]) {
                quoteOrder[0] = tokens[1];
                quoteOrder[1] = tokens[0];
            }
            poolList[poolCount].tokens = tokens;
            poolList[poolCount].amounts[tokens[0]] = amounts[0];
            poolList[poolCount].amounts[tokens[1]] = amounts[1];
            poolList[poolCount].k = amounts[0] * amounts[1];
            poolList[poolCount].prevK = 0;
            poolList[poolCount].quoteOrder = quoteOrder;
            poolList[poolCount].quote = uint256(
                (poolList[poolCount].amounts[quoteOrder[1]] * quoteMultiplier) / 
                poolList[poolCount].amounts[quoteOrder[0]]
            );
            poolList[poolCount].quoteOrig = poolList[poolCount].quote;
            poolList[poolCount].prevQuote = 0;

            poolCount++;

        } else {
            // If order for token in parameter in against pool is revered, swap
            if (!isInTurn) {
                address tmpToken = tokens[0];
                tokens[0] = tokens[1];
                tokens[1] = tmpToken;
                uint256 tmpAmount = amounts[0];
                amounts[0] = amounts[1];
                amounts[1] = tmpAmount;
            }
            // Check quote
            uint256 newQuote = uint256(
                (amounts[1] * quoteMultiplier) / 
                amounts[0]
            );
            uint256 quoteRate = uint256(
                                    (newQuote * quoteMultiplier) / 
                                    poolList[poolIndex].quoteOrig
                                );
            // Check if new quote >= 98% and <= 102%
            require(
                quoteRate > 98 * (10 ** (QUOTE_DECIMALS - 2)) && 
                    quoteRate < 102 * (10 ** (QUOTE_DECIMALS - 2)), 
                "Invalid quote(out of range: 98%~102%)"
            );
            // Update pool
            poolList[poolIndex].amounts[tokens[0]] += amounts[0];
            poolList[poolIndex].amounts[tokens[1]] += amounts[1];
            poolList[poolIndex].prevK = poolList[poolIndex].k;
            poolList[poolIndex].k = poolList[poolIndex].amounts[tokens[0]] * 
                poolList[poolIndex].amounts[tokens[1]];
            poolList[poolIndex].prevQuote = poolList[poolIndex].quote;
            poolList[poolIndex].quote = newQuote;
        }
        // Update pool share
        bExist = false;
        for (uint8 i = 0; i < shares[msg.sender].poolCount; i++) {
            if (poolIndex == shares[msg.sender].pools[i].index) {
                shares[msg.sender].pools[i].sharingAmounts[tokens[0]] += amounts[0];
                shares[msg.sender].pools[i].sharingAmounts[tokens[1]] += amounts[1];
                bExist = true;
                break;
            }
        }
        if (!bExist) {
            shares[msg.sender].pools[0].index = poolIndex;
            shares[msg.sender].pools[0].sharingAmounts[tokens[0]] = amounts[0];
            shares[msg.sender].pools[0].sharingAmounts[tokens[1]] = amounts[1];
            shares[msg.sender].poolCount++;
        }

        // Transfer amounts for both tokens from the sender
        uint256 allowance = IERC20(tokens[0]).allowance(msg.sender, address(this));
        require(allowance >= amounts[0], "OcxLocalPool.addLiquidity(): Insufficient allowance for first token");
        allowance = IERC20(tokens[1]).allowance(msg.sender, address(this));
        require(allowance >= amounts[1], "OcxLocalPool.addLiquidity(): Insufficient allowance for second token");
        TransferHelper.safeTransferFrom(tokens[0], msg.sender, address(this), amounts[0]);
        TransferHelper.safeTransferFrom(tokens[1], msg.sender, address(this), amounts[1]);

        // Mint LP token to return
        // ...
    }
}
