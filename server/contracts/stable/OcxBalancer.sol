// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// import '@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol';
// import '@uniswap/v3-core/contracts/libraries/TickMath.sol';
import '@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol';
import '@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol';
import '@uniswap/v3-periphery/contracts/interfaces/INonfungiblePositionManager.sol';
import '@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol';
import '@uniswap/v3-periphery/contracts/base/LiquidityManagement.sol';
import '@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol';
import "@openzeppelin/contracts/token/ERC20/IERC20.sol"; // openzeppelin 4.5 (for solidity 0.8.x)
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import '../OcxBase.sol';
import '../interface/IOcxBalancer.sol';
import '../interface/IOcxExchange.sol';
import '../interface/IOcxPriceOracle.sol';
import '../interface/IOcxERC20.sol';
import "../common/OcxCommon.sol";

contract OcxBalancer is OcxBase, IOcxBalancer, IERC721Receiver {

    /*
     * one local pool: OCX/OCAT and three UNISWAP POOLS: OCX/OCAT, OCX/DAI and OCX/UNI
     */
    /// @notice Represents the deposit of an NFT
    struct Deposit {
        address owner;
        uint128 liquidity;
        address token0;
        address token1;
    }
    uint24 public constant poolFee = 3000;
    INonfungiblePositionManager public immutable nonfungiblePositionManager;
    IUniswapV2Router02 public uniswapRouter;

    // price ratio between token pair (ex. UCAT-OCX)
    mapping(CommonContracts => TokenPrice) private tokenPrice;

    OcxPrice private ethAudPriceInfo;

    address payable constant UNISWAP_V2_ROUTER02_ADDRESS = 
        payable(address(0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506));
    uint256 private constant MAX_ALLOWED_OCAT_PRICE = 110;
    uint256 private constant MIN_ALLOWED_OCAT_PRICE =  90;
    uint256 amount0ToMint = 1000;
    uint256 amount1ToMint = 1000;

    /// @dev deposits[tokenId] => Deposit
    mapping(uint256 => Deposit) public deposits;

    constructor(
        INonfungiblePositionManager _nonfungiblePositionManager
    ) {
        nonfungiblePositionManager = _nonfungiblePositionManager;
        uniswapRouter = IUniswapV2Router02(UNISWAP_V3_ROUTER_ADDRESS);
    }

    receive() external payable {}
    // Implementing `onERC721Received` so this contract can receive custody of erc721 tokens
    function onERC721Received(
        address operator,
        address,
        uint256 /*tokenId*/,
        bytes calldata
    ) external override pure returns (bytes4) {
        // get position information
        require(operator != address(0), "Invalid operator");
        // _createDeposit(operator, tokenId);

        return this.onERC721Received.selector;
    }
    /*
     * dstTkn: address(0) means that is ETH
     */
    function setPrice(CommonContracts srcTkn, CommonContracts dstTkn, uint256 price, uint8 decimals) 
    public override {
        tokenPrice[srcTkn].to[dstTkn] = OcxPrice(price, decimals);
    }
    function getPrice(CommonContracts srcTkn, CommonContracts dstTkn) 
    public view override
    returns(OcxPrice memory _price) {
        _price = tokenPrice[srcTkn].to[dstTkn];
    }
    function _createDeposit(address owner, uint256 tokenId) internal {
        (, , address token0, address token1, , , , uint128 liquidity, , , , ) =
            nonfungiblePositionManager.positions(tokenId);

        // set the owner and data for position
        // operator is msg.sender
        deposits[tokenId] = Deposit({
            owner: owner, 
            liquidity: liquidity, 
            token0: token0, 
            token1: token1
        });
    }
    /// @notice Calls the mint function defined in periphery, 
    ///   mints the same amount of each token. 
    ///   For this example we are providing 1000 OCAT and 1000 OCX in liquidity
    /// @return tokenId The id of the newly minted ERC721
    /// @return liquidity The amount of liquidity for the position
    /// @return amount0 The amount of token0
    /// @return amount1 The amount of token1
    function mintNewPosition()
        internal onlyAdmin
        returns (
            uint256 tokenId,
            uint128 liquidity,
            uint256 amount0,
            uint256 amount1
        )
    {
        // For this example, we will provide equal amounts of liquidity in both assets.
        // Providing liquidity in both assets means liquidity will be earning fees and 
        //   is considered in-range.

        // Approve the position manager
        TransferHelper.safeApprove(
            contractAddress[CommonContracts.OCAT], 
            address(nonfungiblePositionManager), 
            amount0ToMint
        );
        TransferHelper.safeApprove(
            contractAddress[CommonContracts.OCX], 
            address(nonfungiblePositionManager), 
            amount1ToMint
        );

        INonfungiblePositionManager.MintParams memory params =
            INonfungiblePositionManager.MintParams({
                token0: contractAddress[CommonContracts.OCAT],
                token1: contractAddress[CommonContracts.OCX],
                fee: poolFee,
                tickLower: -887272,
                tickUpper: 887272,
                amount0Desired: amount0ToMint,
                amount1Desired: amount1ToMint,
                amount0Min: 0,
                amount1Min: 0,
                recipient: address(this),
                deadline: block.timestamp
            });

        // Note that the pool defined by contractAddress[CommonContracts.OCAT]/contractAddress[CommonContracts.OCX] and 
        //   fee tier 0.3% must already be created and initialized in order to mint
        (tokenId, liquidity, amount0, amount1) = nonfungiblePositionManager.mint(params);

        // Create a deposit
        _createDeposit(msg.sender, tokenId);

        // Remove allowance and refund in both assets.
        if (amount0 < amount0ToMint) {
            TransferHelper.safeApprove(contractAddress[CommonContracts.OCAT], address(nonfungiblePositionManager), 0);
            TransferHelper.safeTransfer(contractAddress[CommonContracts.OCAT], msg.sender, amount0ToMint - amount0);
        }

        if (amount1 < amount1ToMint) {
            TransferHelper.safeApprove(contractAddress[CommonContracts.OCX], address(nonfungiblePositionManager), 0);
            TransferHelper.safeTransfer(contractAddress[CommonContracts.OCX], msg.sender, amount1ToMint - amount1);
        }
    }
    /// @notice Increases liquidity in the current range
    /// @dev Pool must be initialized already to add liquidity
    /// @param tokenId The id of the erc721 token
    /// @param amount0 The amount to add of token0
    /// @param amount1 The amount to add of token1
    function increaseLiquidityCurrentRange(
        uint256 tokenId,
        uint256 amountAdd0,
        uint256 amountAdd1
    )
        external
        returns (
            uint128 liquidity,
            uint256 amount0,
            uint256 amount1
        )
    {
        INonfungiblePositionManager.IncreaseLiquidityParams memory params =
            INonfungiblePositionManager.IncreaseLiquidityParams({
                tokenId: tokenId,
                amount0Desired: amountAdd0,
                amount1Desired: amountAdd1,
                amount0Min: 0,
                amount1Min: 0,
                deadline: block.timestamp
            });

        (liquidity, amount0, amount1) = nonfungiblePositionManager.increaseLiquidity(params);
    }
    /// @notice A function that decreases the current liquidity by half. An example to show how to call the `decreaseLiquidity` function defined in periphery.
    /// @param tokenId The id of the erc721 token
    /// @return amount0 The amount received back in token0
    /// @return amount1 The amount returned back in token1
    function decreaseLiquidityInHalf(uint256 tokenId) external 
    returns (uint256 amount0, uint256 amount1) {
        // caller must be the owner of the NFT
        require(msg.sender == deposits[tokenId].owner, 'Not the owner');
        // get liquidity data for tokenId
        uint128 liquidity = deposits[tokenId].liquidity;
        uint128 halfLiquidity = liquidity / 2;

        // amount0Min and amount1Min are price slippage checks
        // if the amount received after burning is not greater than these minimums, 
        //  transaction will fail
        INonfungiblePositionManager.DecreaseLiquidityParams memory params =
            INonfungiblePositionManager.DecreaseLiquidityParams({
                tokenId: tokenId,
                liquidity: halfLiquidity,
                amount0Min: 0,
                amount1Min: 0,
                deadline: block.timestamp
            });

        (amount0, amount1) = nonfungiblePositionManager.decreaseLiquidity(params);

        //send liquidity back to owner
        _sendToOwner(tokenId, amount0, amount1);
    }
    /// @notice Collects the fees associated with provided liquidity
    /// @dev The contract must hold the erc721 token before it can collect fees
    /// @param tokenId The id of the erc721 token
    /// @return amount0 The amount of fees collected in token0
    /// @return amount1 The amount of fees collected in token1
    function collectAllFees(uint256 tokenId) external returns (uint256 amount0, uint256 amount1) {
        // Caller must own the ERC721 position, meaning it must be a deposit

        // set amount0Max and amount1Max to uint256.max to collect all fees
        // alternatively can set recipient to msg.sender and avoid another transaction 
        // in `sendToOwner`
        INonfungiblePositionManager.CollectParams memory params =
            INonfungiblePositionManager.CollectParams({
                tokenId: tokenId,
                recipient: address(this),
                amount0Max: type(uint128).max,
                amount1Max: type(uint128).max
            });

        (amount0, amount1) = nonfungiblePositionManager.collect(params);

        // send collected feed back to owner
        _sendToOwner(tokenId, amount0, amount1);
    }
    /// @notice Transfers funds to owner of NFT
    /// @param tokenId The id of the erc721
    /// @param amount0 The amount of token0
    /// @param amount1 The amount of token1
    function _sendToOwner(
        uint256 tokenId,
        uint256 amount0,
        uint256 amount1
    ) internal {
        // get owner of contract
        address owner = deposits[tokenId].owner;

        address token0 = deposits[tokenId].token0;
        address token1 = deposits[tokenId].token1;
        // send collected fees to owner
        TransferHelper.safeTransfer(token0, owner, amount0);
        TransferHelper.safeTransfer(token1, owner, amount1);
    }

    /// @notice Transfers the NFT to the owner
    /// @param tokenId The id of the erc721
    function retrieveNFT(uint256 tokenId) external {
        // must be the owner of the NFT
        require(msg.sender == deposits[tokenId].owner, 'Not the owner');
        // transfer ownership to original owner
        nonfungiblePositionManager.safeTransferFrom(address(this), msg.sender, tokenId);
        //remove information related to tokenId
        delete deposits[tokenId];
    }

    /*
     * A user try to swap OCAT to UNI in our site
     * The system accept and swap OCAT into OCX/OCAT Uniswap pool and get OCX
     * The system swap OCX into OCX/UNI Uniswap pool and get UNI
     * The system return UNI for the user's OCAT
     * As a result, OCAT price to UNI changes
     * The stable algorithm fill back 
     */
    function run() internal 
    onlyValidAddress(contractAddress[CommonContracts.EXCHANGE]) {
        // Get OCAT price to ETH
        OcxPrice memory _ethAudPriceObj = IOcxPriceOracle(contractAddress[CommonContracts.PRICE_ORACLE])
                                            .getEthAudPrice();
        if (ethAudPriceInfo.value == 0) {
            ethAudPriceInfo = _ethAudPriceObj;
            return;
        }
        uint changePercentage = (_ethAudPriceObj.value * 100) / ethAudPriceInfo.value;
        if (changePercentage < MIN_ALLOWED_OCAT_PRICE || 
        changePercentage > MAX_ALLOWED_OCAT_PRICE) {
            return;
        }
        // 
        if (changePercentage > MAX_ALLOWED_OCAT_PRICE) { // If ETH price drop than 10%
            // Force OcxExchange to burn OCAT *******
            uint256 decreaseAmount = 
                ((100 - changePercentage) * IERC20(contractAddress[CommonContracts.OCAT]).totalSupply()) / 
                100;
            // Burn bought OCAT
            IOcxExchange(contractAddress[CommonContracts.EXCHANGE]).burnOcat(decreaseAmount);
        } else {
            // Force OcxExchange to mint OCAT
            uint256 increaseAmount = 
                ((changePercentage - 100) * IERC20(contractAddress[CommonContracts.OCAT]).totalSupply()) / 
                100;
            // Mint bought OCAT
            IOcxExchange(contractAddress[CommonContracts.EXCHANGE]).mintOcat(increaseAmount);
        }
    }
}
