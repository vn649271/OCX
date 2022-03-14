// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract PawnNFT is ERC721URIStorage {

    receive() external payable {}

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    constructor() ERC721("PawnItem", "PNITM") {}

    /**
    * Custom accessor to create a unique token
    */
    function mint(address _to, string memory _tokenURI)
        public
        returns (uint256)
    {
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();

        _safeMint(_to, newItemId);
        _setTokenURI(newItemId, _tokenURI);
        return newItemId;
    }
}