// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/*
 * OCAT/OCX local pool
 */
import "@openzeppelin/contracts/token/ERC20/IERC20.sol"; // openzeppelin 4.5 (for solidity 0.8.x)
// import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import '@uniswap/lib/contracts/libraries/TransferHelper.sol';
import './OcxToken.sol';
import './OcxBase.sol';

contract OcxLocalPool is OcxBase {

    uint256 private constant QUOTE_DECIMALS = 3; // Must be more than 3 at least
    uint256 private constant QUOTE_RATE_DECIMALS = 3; // Must be more than 3 at least

    mapping(string => address payable) private tokens;

    struct Pool {
        address[2] tokenPair;
        mapping(address => uint256) balance;
        uint256 k;
        uint256 prevK;
        uint256 prevQuote;
        uint256 quoteOrig;
        uint256 quote;
    }

    Pool                public      localPool; // token pair: 0: OCAT, 1: OCX
    uint256             public      quoteMultiplier;
    uint256             public      quoteRateMultiplier;

    event SwappedAmount(uint256);
    
    receive() external payable {}

    constructor() {
        quoteMultiplier = 10 ** QUOTE_DECIMALS;
        quoteRateMultiplier = 10 ** QUOTE_RATE_DECIMALS;
    }

    function getAmountsOut(
        uint256 sellAmount, 
        string[2] memory path
    ) public view returns(uint256 amountOut) {
        bool ret1 = _compareStrings(path[0], "OCAT");
        bool ret2 = _compareStrings(path[1], "OCX");
        bool ret3 = _compareStrings(path[0], "OCX");
        bool ret4 = _compareStrings(path[1], "OCAT");
        require(ret1 && ret2 || ret3 && ret4, "getAmountsOut(): Invalid path");

        // Find the ETH/OCAT pool
        uint256 ocatPoolBalance = localPool.balance[ocatAddress];
        uint256 ocxPoolBalance = localPool.balance[ocxAddress];

        if (ret1 && ret2) {
            // Calculate the output amount of OCAT 
            uint256 newOcatPoolBalance = localPool.k / (ocatPoolBalance + sellAmount);
            require(ocxPoolBalance > newOcatPoolBalance, "getAmountsOut(): Insufficient OCX balance in the pool");
            amountOut = ocxPoolBalance - newOcatPoolBalance;
        } else {
            // Calculate the output amount of OCAT 
            uint256 newPoolEthBalance = (localPool.k / (ocxPoolBalance + sellAmount));
            require(ocatPoolBalance > newPoolEthBalance, "getAmountsOut(): Insufficient OCX balance in the pool");
            amountOut = ocatPoolBalance - newPoolEthBalance;            
        }
    }

    function swap(string[2] memory path, uint256 amountIn, uint256 amountOutMin, uint /*_deadline*/)  public payable
    onlyAdmin returns(uint256 amountOut)
    {
        require(tokens[path[0]] == ocatAddress || tokens[path[0]] == ocxAddress, "Invalid source token for local swap");
        require(tokens[path[1]] == ocatAddress || tokens[path[1]] == ocxAddress, "Invalid target token for local swap");
        
        amountOut = getAmountsOut(amountIn, path);
        require(amountOut >= amountOutMin, "Insufficient source balance for your swap");

        // Transfer source token from the sender
        uint256 allowance = IERC20(tokens[path[0]]).allowance(msg.sender, address(this));
        require(allowance >= amountIn, "OcxLocalPool.addLiquidity(): Insufficient allowance for OCAT");
        TransferHelper.safeTransferFrom(tokens[path[0]], msg.sender, address(this), amountIn);

        // Transfer target to the sender
        TransferHelper.safeTransfer(tokens[path[1]], msg.sender, amountOut);

        // Update the quote for the pool
        localPool.balance[tokens[path[0]]] += amountIn;
        localPool.balance[tokens[path[1]]] -= amountOut;
        localPool.prevQuote = localPool.quote;
        localPool.quote = (localPool.balance[ tokens[path[0]] == localPool.tokenPair[0]?tokens[path[0]]:tokens[path[1]] ] * quoteMultiplier) 
                            / 
                            localPool.balance[ tokens[path[0]] == localPool.tokenPair[0]?tokens[path[1]]:tokens[path[0]] ];
        // require(ret, "new ETH balance in the pool is overflowed");
        emit SwappedAmount(amountOut);
    }

    /*
     * Parameters:
     *      amountPair: amount of OCAT/OCX token pair
     */
    function addLiquidity(
        uint256[2] memory amountPair
    ) public payable 
    onlyAdmin {
        require(ocatAddress != address(0), "Invalid OCAT address");
        require(ocxAddress != address(0), "Invalid OCX address");
        require(amountPair[0] > 0 && amountPair[1] > 0, "Invalid amount pair");
        // Get quote
        // ...uint256((quote / localPool.quoteOrig) * 100)
        // Transfer token A and B from msg.sender to this address

        if (localPool.tokenPair[0] == address(0) || localPool.tokenPair[1] == address(0)) {
            localPool.tokenPair = [ocatAddress, ocxAddress];
        }
        tokens['OCAT'] = ocatAddress;
        tokens['OCX'] = ocxAddress;

        // Check quote
        uint256 newQuote = uint256(
            (amountPair[0] * quoteMultiplier) / amountPair[1]
        );
        uint256 quoteRate = uint256(
            (newQuote * quoteRateMultiplier) / localPool.quoteOrig
        );
        // Check if new quote >= 98% and <= 102% against original one
        require(
            quoteRate > 98 * (10 ** (QUOTE_DECIMALS - 2)) && 
            quoteRate < 102 * (10 ** (QUOTE_DECIMALS - 2)), 
            "Invalid quote(out of range: 98%~102%)"
        );
        // Update pool
        localPool.balance[ocatAddress] += amountPair[0];
        localPool.balance[ocxAddress] += amountPair[1];
        localPool.prevK = localPool.k;
        localPool.k = localPool.balance[ocatAddress] * 
                    localPool.balance[ocxAddress];
        localPool.prevQuote = localPool.quote;
        localPool.quote = newQuote;

        // Transfer amounts for both tokenPair from the sender
        uint256 allowance = IERC20(ocatAddress).allowance(msg.sender, address(this));
        require(allowance >= amountPair[0], "OcxLocalPool.addLiquidity(): Insufficient allowance for OCAT");
        TransferHelper.safeTransferFrom(ocatAddress, msg.sender, address(this), amountPair[0]);

        allowance = IERC20(ocxAddress).allowance(msg.sender, address(this));
        require(allowance >= amountPair[1], "OcxLocalPool.addLiquidity(): Insufficient allowance for OCX");
        TransferHelper.safeTransferFrom(ocxAddress, msg.sender, address(this), amountPair[1]);
        // Mint LP token to return
        // ...
        // uint256 newMintAmount = amountPair[0] * amountPair[1];
        // IERC20(_ocxAddress).mint(newMintAmount);
        // // Send the amountPair[1] with fee substracted
        // IERC20(_ocxAddress).transfer(msg.sender, (newMintAmount * 100 - 2) / 100)
    }
}
