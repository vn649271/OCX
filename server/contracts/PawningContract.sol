// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract PawningContract is ReentrancyGuard {
    
    using Counters for Counters.Counter;
    Counters.Counter private _itemIds;
    Counters.Counter private _itemsPawned;
    
    address public owner;
    
    receive() external payable {}

    constructor() {
        owner = msg.sender;
    }
    
    struct PawningItem {
        uint itemId;
        address nftContract;
        uint256 tokenId;
        address payable pawnee;
        address payable owner;
        uint256 price;
        bool pawned;
    }

    mapping(uint256 => PawningItem) private idToPawningItem;

    event PawningItemCreated (
        uint indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address pawnee,
        address owner,
        uint256 price,
        bool pawned
    );

    event ItemPawned (
        uint indexed itemId,
        address owner
    );

    function createPawningItem(
        address nftContract,
        uint256 tokenId,
        uint256 price
    ) public payable nonReentrant {
        require(price > 0, "Price must be greater than 0");

        _itemIds.increment();
        uint256 itemId = _itemIds.current();

        idToPawningItem[itemId] =  PawningItem(
            itemId,
            nftContract,
            tokenId,
            payable(msg.sender),
            payable(address(0)),
            price,
            false
        );

        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

        emit PawningItemCreated(
            itemId,
            nftContract,
            tokenId,
            msg.sender,
            address(0),
            price,
            false
        );
    }

    function createMarketSale(
        address nftContract,
        uint256 itemId
    ) public payable nonReentrant {
        uint price = idToPawningItem[itemId].price;
        uint tokenId = idToPawningItem[itemId].tokenId;
        bool pawned = idToPawningItem[itemId].pawned;
        require(msg.value == price, "Please submit the asking price in order to complete the purchase");
        require(pawned != true, "This Sale has alredy finnished");
        emit ItemPawned(
            itemId,
            msg.sender
        );

        idToPawningItem[itemId].pawnee.transfer(msg.value);
        IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);
        idToPawningItem[itemId].owner = payable(msg.sender);
        _itemsPawned.increment();
        idToPawningItem[itemId].pawned = true;
    }

    function fetchPawningItems() public view returns (PawningItem[] memory) {
        uint itemCount = _itemIds.current();
        uint unpawnedItemCount = _itemIds.current() - _itemsPawned.current();
        uint currentIndex = 0;

        PawningItem[] memory items = new PawningItem[](unpawnedItemCount);
        for (uint i = 0; i < itemCount; i++) {
            if (idToPawningItem[i + 1].owner == address(0)) {
                uint currentId = i + 1;
                PawningItem storage currentItem = idToPawningItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }
}
