// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

// PawnNFTs smart contract inherits ERC721 interface
contract PawnNFTs is ERC721 {

  // this contract's token collection name
  string public collectionName;
  // this contract's token symbol
  string public collectionNameSymbol;
  // total number of pawning NFTs minted
  uint256 public pawnNFTCounter;

  // define pawning NFT struct
   struct PawnNFT {
    uint256 tokenId;
    string tokenName;
    string tokenURI;
    address payable mintedBy;
    address payable currentOwner;
    address payable previousOwner;
    uint256 price;
    uint256 numberOfTransfers;
    bool forSale;
  }

  // map pawnNft's token id to pawning NFT
  mapping(uint256 => PawnNFT) public allPawnNFTs;
  // 
  mapping(uint256 => string) public tokenURIs;
  // check if token name exists
  mapping(string => bool) public tokenNameExists;
  // check if token URI exists
  mapping(string => bool) public tokenURIExists;

  receive() external payable {}

  // initialize contract while deployment with contract's collection name and token
  constructor() ERC721("Openchain Pawning NFTs Collection", "PNFT") {
    collectionName = name();
    collectionNameSymbol = symbol();
  }

  /**
    * @dev Base URI for computing {tokenURI}. If set, the resulting URI for each
    * token will be the concatenation of the `baseURI` and the `tokenId`. Empty
    * by default, can be overriden in child contracts.
    */
  function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
    require(_exists(tokenId), "PawnNFTs: URI query for nonexistent token");
    // require(tokenURIs[tokenId] != 0, "PawnNFTs: URI query for token without token URI");
    return tokenURIs[tokenId];
  }
  
  function _setTokenURI(uint tokenId, string memory _tokenURI) internal {
    tokenURIs[tokenId] = _tokenURI;
  }

  function totalSupply() public view returns(uint256) {
    return pawnNFTCounter;
  }

  // mint a new pawning NFT
  function mintPawnNFT(string memory _name, string memory _tokenURI, uint256 _price) external {
    // check if thic fucntion caller is not an zero address account
    require(msg.sender != address(0));
    // increment counter
    pawnNFTCounter ++;
    // check if a token exists with the above token id => incremented counter
    require(!_exists(pawnNFTCounter));

    // check if the token URI already exists or not
    require(!tokenURIExists[_tokenURI]);
    // check if the token name already exists or not
    require(!tokenNameExists[_name]);

    // mint the token
    _mint(msg.sender, pawnNFTCounter);
    // set token URI (bind token id with the passed in token URI)
    _setTokenURI(pawnNFTCounter, _tokenURI);

    // make passed token URI as exists
    tokenURIExists[_tokenURI] = true;
    // make token name passed as exists
    tokenNameExists[_name] = true;

    // creat a new pawning NFT (struct) and pass in new values
    PawnNFT memory newPawnNFT = PawnNFT(
      pawnNFTCounter,
      _name,
      _tokenURI,
      payable(msg.sender),
      payable(msg.sender),
      payable(address(0)),
      _price,
      0,
      true
    );
    // add the token id and it's pawning NFT to all pawning NFTs mapping
    allPawnNFTs[pawnNFTCounter] = newPawnNFT;
  }

  // get owner of the token
  function getTokenOwner(uint256 _tokenId) public view returns(address) {
    address _tokenOwner = ownerOf(_tokenId);
    return _tokenOwner;
  }

  // get metadata of the token
  function getTokenMetaData(uint _tokenId) public view returns(string memory) {
    string memory tokenMetaData = tokenURI(_tokenId);
    return tokenMetaData;
  }

  // get total number of tokens minted so far
  function getNumberOfTokensMinted() public view returns(uint256) {
    uint256 totalNumberOfTokensMinted = totalSupply();
    return totalNumberOfTokensMinted;
  }

  // get total number of tokens owned by an address
  function getTotalNumberOfTokensOwnedByAnAddress(address _owner) public view returns(uint256) {
    uint256 totalNumberOfTokensOwned = balanceOf(_owner);
    return totalNumberOfTokensOwned;
  }

  // check if the token already exists
  function getTokenExists(uint256 _tokenId) public view returns(bool) {
    bool tokenExists = _exists(_tokenId);
    return tokenExists;
  }

  // by a token by passing in the token's id
  function buyToken(uint256 _tokenId) public payable {
    // check if the function caller is not an zero account address
    require(msg.sender != address(0));
    // check if the token id of the token being bought exists or not
    require(_exists(_tokenId));
    // get the token's owner
    address tokenOwner = ownerOf(_tokenId);
    // token's owner should not be an zero address account
    require(tokenOwner != address(0));
    // the one who wants to buy the token should not be the token's owner
    require(tokenOwner != msg.sender);
    // get that token from all pawning NFTs mapping and create a memory of it defined as (struct => PawnNFT)
    PawnNFT memory pawnNft = allPawnNFTs[_tokenId];
    // price sent in to buy should be equal to or more than the token's price
    require(msg.value >= pawnNft.price);
    // token should be for sale
    require(pawnNft.forSale);
    // transfer the token from owner to the caller of the function (buyer)
    _transfer(tokenOwner, msg.sender, _tokenId);
    // get owner of the token
    address payable sendTo = pawnNft.currentOwner;
    // send token's worth of ethers to the owner
    sendTo.transfer(msg.value);
    // update the token's previous owner
    pawnNft.previousOwner = pawnNft.currentOwner;
    // update the token's current owner
    pawnNft.currentOwner = payable(msg.sender);
    // update the how many times this token was transfered
    pawnNft.numberOfTransfers += 1;
    // set and update that token in the mapping
    allPawnNFTs[_tokenId] = pawnNft;
  }

  function _afterTokenTransfer(
      address from,
      address to,
      uint256 tokenId
  ) internal virtual override {
    // Now the owner of the token ID is "to"
    require(ERC721.ownerOf(tokenId) == to, "PawnNFTs: transfer from incorrect owner");
    require(to != address(0), "PawnNFTs: transfer to the zero address");

    // update token's owner
    PawnNFT memory pawnNft = allPawnNFTs[tokenId];
    // update the token's previous owner
    pawnNft.previousOwner = pawnNft.currentOwner;
    // update the token's current owner
    pawnNft.currentOwner = payable(to);
    // set and update that token in the mapping
    allPawnNFTs[tokenId] = pawnNft;
  }

  function changeTokenPrice(uint256 _tokenId, uint256 _newPrice) public {
    // require caller of the function is not an empty address
    require(msg.sender != address(0));
    // require that token should exist
    require(_exists(_tokenId));
    // get the token's owner
    address tokenOwner = ownerOf(_tokenId);
    // check that token's owner should be equal to the caller of the function
    require(tokenOwner == msg.sender);
    // get that token from all pawning NFTs mapping and create a memory of it defined as (struct => PawnNFT)
    PawnNFT memory pawnNft = allPawnNFTs[_tokenId];
    // update token's price with new price
    pawnNft.price = _newPrice;
    // set and update that token in the mapping
    allPawnNFTs[_tokenId] = pawnNft;
  }

  // switch between set for sale and set not for sale
  function toggleForSale(uint256 _tokenId) public {
    // require caller of the function is not an empty address
    require(msg.sender != address(0));
    // require that token should exist
    require(_exists(_tokenId));
    // get the token's owner
    address tokenOwner = ownerOf(_tokenId);
    // check that token's owner should be equal to the caller of the function
    require(tokenOwner == msg.sender);
    // get that token from all pawning NFTs mapping and create a memory of it defined as (struct => PawnNFT)
    PawnNFT memory pawnNft = allPawnNFTs[_tokenId];
    // if token's forSale is false make it true and vice versa
    if(pawnNft.forSale) {
      pawnNft.forSale = false;
    } else {
      pawnNft.forSale = true;
    }
    // set and update that token in the mapping
    allPawnNFTs[_tokenId] = pawnNft;
  }
}