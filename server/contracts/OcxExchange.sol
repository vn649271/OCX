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
import "./PawnNFTs.sol";
import "./OcatToken.sol";

contract OcxExchange {

    address private constant UNISWAP_ROUTER_ADDRESS = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;

    struct Pool {
        address[2] tokens;
        uint256[2] amounts;
        uint256 k;
        uint256 prevK;
        uint8[2] quoteOrder;
        uint256 prevQuote;
        uint256 quoteOrig;
        uint256 quote;
    }
    struct PoolShare {
        uint8 poolIndex;
        uint256[2] amounts;
    }

    IUniswapV2Router02 public uniswapRouter;
    address payable private pnftAddress;
    address payable private ocatAddress;
    address payable private creator;

    Pool[] poolList;
    // mapping(address => PoolShare) public poolShare;
    mapping(address => PoolShare[]) public poolShare;

    receive() external payable {}

    constructor() {
        creator = payable(msg.sender);
        uniswapRouter = IUniswapV2Router02(UNISWAP_ROUTER_ADDRESS);
    }

    function setPnftAddress(address payable _pnftAddress) public {
        require(creator == msg.sender, "OcxExchange.setPNFTAddress(): Caller for  must be creator");
        require(_pnftAddress != address(0), "OcxExchange.setPNFTAddress(): Invalid parameter");
        pnftAddress = _pnftAddress;
    }

    function setOcatAddress(address payable _ocatAddress) public {
        require(creator == msg.sender, "OcxExchange.setOcatAddress(): Caller for  must be creator");
        require(_ocatAddress != address(0), "OcxExchange.setOcatAddress(): Invalid parameter");
        ocatAddress = _ocatAddress;
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

    function onERC721Received(
        address payable operator,
        address payable from,
        uint256 tokenId,
        bytes calldata data
    ) external pure returns (bytes4) {
        return this.onERC721Received.selector;
    }

    function exchangeToOcat(uint256 nftID) public {
        require(msg.sender != address(this), "exchangeToOcat(): Error: Caller couldn't be same to this address");
        require(msg.sender != address(0), "exchangeToOcat(): Invalid caller");
        require(nftID > 0, "exchangeToOcat(): Invalid NFT ID");
        uint256 ocatBalance = IERC20(ocatAddress).balanceOf(address(this));
        // Get price for the NFT
        (,,,,,,uint256 price,,) = PawnNFTs(payable(address(pnftAddress))).allPawnNFTs(nftID);
        // uint256 price = nftItem.price;
        require(ocatBalance >= price, "Insufficient balance of OCAT in the contract");
        // safeTransferFrom: send NFT from caller to the address
        IERC721(pnftAddress).safeTransferFrom(msg.sender, address(this), nftID);
        // Pay OCAT for the NFT
        IERC20(ocatAddress).transfer(msg.sender, price);
        //   Then transfer OCATs from the address to caller
        // TransferHelper.safeTransferFrom(ocatAddress, address(this), msg.sender, price);
    }

    function exchangeFromOcat(uint256 nftID) public {
        require(msg.sender != address(this), "exchangeToOcat(): Error: Caller couldn't be same to this address");
        require(msg.sender != address(0), "exchangeToOcat(): Invalid caller");
        require(nftID > 0, "exchangeToOcat(): Invalid NFT ID");
        uint256 ocatBalance = IERC20(ocatAddress).balanceOf(msg.sender);
        // Get price for the NFT
        (,,,,,,uint256 price,,) = PawnNFTs(payable(address(pnftAddress))).allPawnNFTs(nftID);
        // uint256 price = nftItem.price;
        require(ocatBalance >= price, "Insufficient balance of OCAT in the account");
        // safeTransferFrom: send NFT from caller to the address
        TransferHelper.safeTransferFrom(ocatAddress, msg.sender, address(this), price);
        // Pay OCAT for the NFT
        IERC721(pnftAddress).safeTransferFrom(address(this), msg.sender, nftID);
        //   Then transfer OCATs from the address to caller
        // TransferHelper.safeTransferFrom(ocatAddress, address(this), msg.sender, price);
    }

    function _getPoolIndex(
        address token0,
        address token1
     ) internal view returns (bool bFound, uint8 poolIndex, bool isInTurn)  {
        bFound = false;
        poolIndex = 0;
        isInTurn = true;
        for (uint8 i = 0; i < poolList.length; i++) {
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
//    ) public returns (uint256 amountA, uint256 amountB, uint liquidity) {
    ) public {
        require(msg.sender != address(0), "Invalid sender");
        require(tokens[0] != address(0) && tokens[1] != address(0), "Invalid tokens");
        require(tokens[0] != tokens[1], "Same tokens");
        require(amounts[0] > 0 && amounts[1] > 0, "Invalid amounts");

        // If the amount of OCAT is limited, then assert sender must be creator
        // Otherwise OCAT can be issued with swapping from/to PNFT continuosly,
        //   following assertion must be removed
        require(creator == msg.sender);

        // Get quote
        // ...uint256((quote / poolList[poolIndex].quoteOrig) * 100)
        // Transfer token A and B from msg.sender to this address

        bool bExist = false;
        bool isInTurn = true;
        uint8 poolIndex = 0;

        (bExist, poolIndex, isInTurn) = _getPoolIndex(tokens[0], tokens[1]);
        if (!bExist) {
            uint8[2] memory quoteOrder = [0, 1];
            if (amounts[0] < amounts[1]) {
                quoteOrder = [1, 0];
            }
            poolList.push(Pool(
                {
                    tokens: tokens,
                    amounts: amounts, 
                    k: amounts[0] * amounts[1],
                    prevK: 0,
                    quoteOrder: quoteOrder,
                    quoteOrig: uint256((amounts[quoteOrder[0]] / amounts[quoteOrder[1]]) * 1000),
                    quote: uint256((amounts[quoteOrder[0]] / amounts[quoteOrder[1]]) * 1000),
                    prevQuote: 0
                })
            );
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
            uint256 quote = uint256(
                (
                    amounts[poolList[poolIndex].quoteOrder[0]] / 
                    amounts[poolList[poolIndex].quoteOrder[1]]
                ) * 1000
            );
            uint256 orgQuote = uint256((quote / poolList[poolIndex].quoteOrig) * 1000);
            require(orgQuote > 1020 || orgQuote < 980, "Invalid quote");
            // Update pool
            Pool memory pool = poolList[poolIndex];
            pool.amounts[0] += amounts[0];
            pool.amounts[1] += amounts[1];
            pool.prevK = pool.k;
            pool.k = pool.amounts[0] * pool.amounts[1];
            pool.prevQuote = pool.quote;
            pool.quote = uint256(
                (
                    pool.amounts[poolList[poolIndex].quoteOrder[0]] / 
                    pool.amounts[poolList[poolIndex].quoteOrder[0]]
                ) * 1000
            );
            poolList[poolIndex] = pool;
        }
        bExist = false;
        for (uint i = 0; i < poolShare[msg.sender].length; i++) {
            if (poolIndex == poolShare[msg.sender][i].poolIndex) {
                poolShare[msg.sender][i].amounts[0] += amounts[0];
                poolShare[msg.sender][i].amounts[1] += amounts[1];
                bExist = true;
                break;
            }
        }
        if (!bExist) {
            poolShare[msg.sender].push(PoolShare(poolIndex, amounts));
        }

        // Mint LP token to return
        // ...
        // amountA = amounts[0];
        // amountB = amounts[1];
    }

    ////////////////////////////////////////////////////////////////////////////////////////
    function strConcat(
            string memory _a, 
            string memory _b, 
            string memory _c, 
            string memory _d, 
            string memory _e
    ) internal view returns (string memory){
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

    function strConcat(
            string memory _a, 
            string memory _b, 
            string memory _c, 
            string memory _d
    ) internal view returns (string memory) {
        return strConcat(_a, _b, _c, _d, "");
    }

    function strConcat(
            string memory _a, 
            string memory _b, 
            string memory _c
    ) internal view returns (string memory) {
        return strConcat(_a, _b, _c, "", "");
    }

    function strConcat(
            string memory _a, 
            string memory _b
    ) internal view returns (string memory) {
        return strConcat(_a, _b, "", "", "");
    }
}
