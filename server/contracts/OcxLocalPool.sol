// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol"; // openzeppelin 4.5 (for solidity 0.8.x)
// import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import '@uniswap/lib/contracts/libraries/TransferHelper.sol';
import "./OcxLPToken.sol";

contract OcxLocalPool {

    uint256 private constant QUOTE_DECIMALS = 3; // Must be more than 3 at least

    address payable private ocatAddress;
    address payable private ocxLPAddress;

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

    modifier onlyCreator {
        require(creator != address(0), "Invalid creator address");
        require(msg.sender == creator, "Caller must be creator");
        _;
    }

    modifier mustBeNoneZero(address _address) {
        require(_address != address(0), "The address must can't be zero");
        _;
    }

    /*
     * Error Code
     *  -1: Caller for  must be creator
     *  -2: Invalid parameter
     */
    function setOcatAddress(address payable _ocatAddress) public 
    onlyCreator mustBeNoneZero(_ocatAddress) {
        ocatAddress = _ocatAddress;
    }

    /*
     * Error Code
     *  -1: Caller for  must be creator
     *  -2: Invalid parameter
     */
    function setOcxLPAddress(address payable _ocxlpAddress) public 
    onlyCreator mustBeNoneZero(_ocxlpAddress) {
        ocxLPAddress = _ocxlpAddress;
        OcxLPToken(ocxLPAddress).setOcxPoolAddress( payable(address(this)) );
    }

    function _compareStrings(string memory a, string memory b) internal pure returns (bool) {
        return (keccak256(abi.encodePacked((a))) == keccak256(abi.encodePacked((b))));
    }

    function getAmountsOut(
        uint256 sellAmount, 
        string[2] memory path
    ) public view returns(uint256 amountOut, uint8 poolIndex) {
        bool ret1 = _compareStrings(path[0], "ETH");
        bool ret2 = _compareStrings(path[1], "OCAT");
        bool ret3 = _compareStrings(path[0], "OCAT");
        bool ret4 = _compareStrings(path[1], "ETH");
        require(ret1 && ret2 || ret3 && ret4, "getAmountsOut(): Invalid path");

        // Find the ETH/OCAT pool
        bool bFound = false;
        bool isInTurn = false;
        (bFound, poolIndex, isInTurn) = _getPoolIndex(address(0), ocatAddress);
        uint256 ethPoolBalance = poolList[poolIndex].amounts[address(0)];
        uint256 ocatPoolBalance = poolList[poolIndex].amounts[ocatAddress];

        if (ret1 && ret2) {
            // Check if the pool exists
            require(bFound, "getAmountsOut(): -1");
            // Ensure that OCAT balance is more than 0
            require(ocatPoolBalance > 0, "getAmountsOut(): -2");
            // Calculate the output amount of OCAT 
            uint256 newOcatPoolBalance = poolList[poolIndex].k / (ethPoolBalance + sellAmount);
            require(ocatPoolBalance > newOcatPoolBalance, "getAmountsOut(): -3");
            amountOut = ocatPoolBalance - newOcatPoolBalance;
        } else {
            // Check if the pool exists
            require(bFound, "getAmountsOut(): -4");
            // Ensure that OCAT balance is more than 0
            require(ethPoolBalance > 0, "getAmountsOut(): -5");
            // Calculate the output amount of OCAT 
            uint256 newPoolEthBalance = (poolList[poolIndex].k / (ocatPoolBalance + sellAmount));
            require(ethPoolBalance > newPoolEthBalance, "getAmountsOut(): -6");
            amountOut = ethPoolBalance - newPoolEthBalance;            
        }
    }

    /*
     * Error Code
     *  -1: Invalid sender
     *  -2: Invalid ETH amount
     *  -7: Insufficient OCAT balance in the pool(3)
     */
    function swapEthToOcat(uint _amountOutMin, address payable to, uint /*_deadline*/) public payable {
        require(to != address(0) && to != address(this), "swapEthToOcat(): -1");
        require(msg.value > 0, "swapEthToOcat(): -2");

        (uint256 amountOut, uint8 poolIndex) = getAmountsOut(msg.value, ["ETH", "OCAT"]);
        require(amountOut >= _amountOutMin, "swapEthToOcat(): -7");

        // Transfer OCAT to the sender
        IERC20(ocatAddress).transfer(msg.sender, amountOut);

        // Update the quote for the pool
        poolList[poolIndex].amounts[address(0)] += msg.value;
        poolList[poolIndex].amounts[ocatAddress] -= amountOut;
        poolList[poolIndex].prevQuote = poolList[poolIndex].quote;

        // (bool ret, uint256 newEthPoolBalance) = SafeMath.tryMul(
        //     poolList[poolIndex].amounts[address(0)], 
        //     10 ** QUOTE_DECIMALS
        // );
        uint256 newEthPoolBalance = poolList[poolIndex].amounts[address(0)] * (10 ** QUOTE_DECIMALS);
        // require(ret, "new ETH balance in the pool is overflowed");
        poolList[poolIndex].quote = newEthPoolBalance / poolList[poolIndex].amounts[ocatAddress];
    }

    /*
     * Error Code
     *  -1: Invalid sender
     *  -2: The sender must be different than this
     *  -8: Insufficient ETH balance in the pool(3)
     *  -9: Insufficient allowed amount for input token
     */
    function swapOcatToEth(
            uint _amountIn, 
            uint _amountOutMin, 
            address payable to, 
            uint /*_deadline*/
    ) public returns (uint256 amountOut) {
        require(to != address(0), "swapOcatToEth(): -1");
        require(to != address(this), "swapOcatToEth(): -2");
        require(_amountIn > 0, "swapOcatToEth(): -3");
        // Get ETH balance in the pool
        uint8 poolIndex;
        (amountOut, poolIndex) = getAmountsOut(_amountIn, ["OCAT", "ETH"]);
        require(amountOut >= _amountOutMin, "swapOcatToEth(): -8");
        emit AmountToRetrieve(amountOut);
        // Transfer OCAT from the sender
        // First check allowance of OCAT amount from the sender
        uint256 allowance = IERC20(ocatAddress).allowance(to, address(this));
        require(allowance >= _amountIn, "swapOcatToEth(): -9");
        // Transfer OCAT from the sender
        TransferHelper.safeTransferFrom(ocatAddress, to, address(this), _amountIn);
        // Transfer ETH to the sender
        TransferHelper.safeTransferETH(to, amountOut);

        emit AmountToRetrieve(amountOut);

        // Update the quote for the pool
        poolList[poolIndex].amounts[ocatAddress] += _amountIn;
        poolList[poolIndex].amounts[address(0)] -= amountOut;
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

    function addLiquidityWithETH(
        address token, 
        uint256 amount
    ) public payable {
        require(msg.sender != address(0), "Invalid sender");
        require(token != address(0), "Invalid token");
        require(amount > 0, "Invalid amount");
        // If the amount of OCAT is limited, then assert sender must be creator
        // Otherwise OCAT is mintable with swapping from/to PNFT continuosly,
        //   following assertion must be removed
        require(creator == msg.sender, "addLiquidityWithETH(): No allowed");

        // Get quote
        // ...uint256((quote / poolList[poolIndex].quoteOrig) * 100)
        // Transfer token A and B from msg.sender to this address

        bool bExist = false;
        bool isInTurn = true;
        uint8 poolIndex = 0;
        uint256 quoteMultiplier = 10 ** QUOTE_DECIMALS;

        (bExist, poolIndex, isInTurn) = _getPoolIndex(address(0), token);
        if (!bExist) {
            address[2] memory quoteOrder;
            quoteOrder[0] = address(0);
            quoteOrder[1] = token;

            if (msg.value > amount) {
                quoteOrder[0] = token;
                quoteOrder[1] = address(0);
            }
            poolList[poolCount].tokens = [address(0), token];
            poolList[poolCount].amounts[address(0)] = msg.value;
            poolList[poolCount].amounts[token] = amount;
            poolList[poolCount].k = msg.value * amount;
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
            // Check quote
            uint256 newQuote = uint256(
                (amount * quoteMultiplier) / 
                msg.value
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
            poolList[poolIndex].amounts[address(0)] += msg.value;
            poolList[poolIndex].amounts[token] += amount;
            poolList[poolIndex].prevK = poolList[poolIndex].k;
            poolList[poolIndex].k = poolList[poolIndex].amounts[address(0)] * 
                poolList[poolIndex].amounts[token];
            poolList[poolIndex].prevQuote = poolList[poolIndex].quote;
            poolList[poolIndex].quote = newQuote;
        }
        // Update pool share
        bExist = false;
        for (uint8 i = 0; i < shares[msg.sender].poolCount; i++) {
            if (poolIndex == shares[msg.sender].pools[i].index) {
                shares[msg.sender].pools[i].sharingAmounts[address(0)] += msg.value;
                shares[msg.sender].pools[i].sharingAmounts[token] += amount;
                bExist = true;
                break;
            }
        }
        if (!bExist) {
            shares[msg.sender].pools[0].index = poolIndex;
            shares[msg.sender].pools[0].sharingAmounts[address(0)] = msg.value;
            shares[msg.sender].pools[0].sharingAmounts[token] = amount;
            shares[msg.sender].poolCount++;
        }

        // Transfer amounts for both tokens from the sender
        uint256 allowance = IERC20(token).allowance(msg.sender, address(this));
        require(allowance >= amount, "OcxLocalPool.addLiquidity(): Insufficient allowance for second token");
        TransferHelper.safeTransferFrom(token, msg.sender, address(this), amount);

        // Mint LP token to return
        // ...
        // uint256 newMintAmount = msg.value * amount;
        // IERC20(ocxLPAddress).mint(newMintAmount);
        // // Send the amount with fee substracted
        // IERC20(ocxLPAddress).transfer(msg.sender, (newMintAmount * 100 - 2) / 100)
    }
}
