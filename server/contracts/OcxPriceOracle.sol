// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "witnet-solidity-bridge/contracts/interfaces/IWitnetPriceRouter.sol";

contract OcxPriceOracle {
    IWitnetPriceRouter public router;
    
    /**
     * IMPORTANT: replace the address below with the WitnetPriceRouter address
     * of the network you are using! Please find the address here:
     * https://docs.witnet.io/smart-contracts/price-feeds/contract-addresses
     */
    constructor() {
        // router = IWitnetPriceRouter(0x83a757eae821ad7b520d9a74952337138a80b2af); // for 
        router = IWitnetPriceRouter(0x1cF3Aa9DBF4880d797945726B94B9d29164211BE); // for Goerli
    }
    
    /// Returns the BTC / USD price (6 decimals), ultimately provided by the Witnet oracle.
    function getBtcUsdPrice() public view returns (int256 _price) {
        // (_price,,) = router.valueFor(bytes32(uint256(0x24beead4)));
        (_price,,) = router.valueFor(bytes32(uint256(0x24beead43216e490aa240ef0d32e18c57beea168f06eabb94f5193868d500946)));
    }
    
    /// Returns the ETH / USD price (6 decimals), ultimately provided by the Witnet oracle.
    function getEthUsdPrice() public view returns (int256 _price) {
        // (_price,,) = router.valueFor(bytes32(uint256(0x3d15f701)));
        (_price,,) = router.valueFor(bytes32(uint256(0x3d15f7018db5cc80838b684361aaa100bfadf8a11e02d5c1c92e9c6af47626c8)));
    }
    
    /// Returns the BTC / ETH price (6 decimals), derived from the ETH/USD and 
    /// the BTC/USD pairs that were ultimately provided by the Witnet oracle.
    function getBtcEthPrice() public view returns (int256 _price) {
        return (1000000 * getBtcUsdPrice()) / getEthUsdPrice();
    }
}