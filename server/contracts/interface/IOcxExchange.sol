// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// https://soliditydeveloper.com/uniswap2
// https://docs.uniswap.org/protocol/V2/guides/smart-contract-integration/trading-from-a-smart-contract
// https://ethereum.org/ru/developers/tutorials/transfers-and-approval-of-erc-20-tokens-from-a-solidity-smart-contract/
// https://solidity-by-example.org/app/erc20/

import "./IOcxBase.sol";

interface IOcxExchange is IOcxBase {

    function swap(
        address _tokenIn,
        uint _amountIn,
        address _tokenOut,
        uint _amountOutMin,
        uint _deadline
    ) external;
    /**
     *  Mint OCAT by funding ETH
     */
    function mintOcat() external payable;
    /**
     * Mint OCAT as specified amount
     */
    function mintOcat(uint256 amount) external;
    function burnOcat(uint256 amount) external;
    function mintOcx(uint256 amount) external payable;
    function burnOcx(uint256 amount) external;
    function setQuote(CurrencyIndex left, CurrencyIndex right, OcxPrice memory newQuote) external;
    function getQuote(CurrencyIndex left, CurrencyIndex right) external view returns(OcxPrice memory);
}
