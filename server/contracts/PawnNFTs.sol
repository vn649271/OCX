// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./AdministratedContract.sol";

  /*
   * -2: mintPawnNFT(): Error: caller of zero address
   * -3: Too small price
   * -4: PawnNFTs.mintPawnNFT(): The token id already exists
   * -5: PawnNFTs.mintPawnNFT(): The token URI already exists
   * -6: PawnNFTs.mintPawnNFT(): The token name already exists
   * -7: Invalid token id
   * -8: buyToken(): Error: caller of zero address
   * -9: buyToken(): The token id already exists
   * -10: buyToken(): Error: token owner of zero address
   * -11: buyToken(): Error: buyer is token owner
   * -12: buyToken(): Not enough funds
   * -13: buyToken(): Token should be for sale
   * -14: PawnNFTs: transfer from incorrect owner
   * -15: PawnNFTs: transfer to the zero address
   * -16: 
   * -17: 
   * -18: 
   * -19: 
   * -20: 
   */

// PawnNFTs smart contract inherits ERC721 interface
contract PawnNFTs is ERC721, AdministratedContract {

  using Counters for Counters.Counter;

  // this contract's token collection name
  string public collectionName;
  // this contract's token symbol
  string public collectionNameSymbol;
  // total number of pawning NFTs minted
  Counters.Counter private pawnNFTCounter;

  uint64          private minPnftPrice = 5000;

  uint  public decimals = 0;
  
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
    bool mintedNativeToken;
  }

  // map pawnNft's token id to pawning NFT
  mapping(uint256 => PawnNFT) public allPawnNFTs;
  // 
  mapping(uint256 => string) public tokenURIs;
  // check if token name exists
  mapping(string => bool) public tokenNameExists;
  // check if token URI exists
  mapping(string => uint256) public tokenURIExists;

  receive() external payable {}

  // initialize contract while deployment with contract's collection name and token
  constructor() ERC721("Openchain Pawning NFTs Collection", "PNFT") {
    collectionName = name();
    collectionNameSymbol = symbol();
  }

  modifier onlyTokenOwner(uint256 _tokenId) virtual {
    // check if the token id of the token being bought exists or not
    require(_exists(_tokenId), "-9");
    address tokenOwner = ownerOf(_tokenId);
    // token's owner should not be an zero address account
    require(tokenOwner != address(0), "-10");
    // the one who wants to buy the token should not be the token's owner
    require(tokenOwner == msg.sender, "-11");
    _;
  }

  /**
    * @dev Base URI for computing {tokenURI}. If set, the resulting URI for each
    * token will be the concatenation of the `baseURI` and the `tokenId`. Empty
    * by default, can be overriden in child contracts.
    */
  function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
    require(_exists(tokenId), "-1");
    // require(tokenURIs[tokenId] != 0, "PawnNFTs: URI query for token without token URI");
    return tokenURIs[tokenId];
  }
  
  function _setTokenURI(uint tokenId, string memory _tokenURI) internal {
    tokenURIs[tokenId] = _tokenURI;
  }

  function totalSupply() public view returns(uint256) {
    return pawnNFTCounter.current();
  }

  function setMinPnftPrice(uint8 _minPnftPrice) public 
  // onlyAdmin 
  {
      minPnftPrice = _minPnftPrice;
  }

  // mint a new pawning NFT and return token ID
  function mintPawnNFT(string memory _name, string memory _tokenURI, uint256 _price) external 
  onlyValidCaller returns(uint256) {
    require(_price >= minPnftPrice, "-3");
    // increment counter
    pawnNFTCounter.increment();
    uint256 newTokenID = pawnNFTCounter.current();
    // check if a token exists with the above token id => incremented counter
    require(!_exists(newTokenID), "-4");

    // check if the token URI already exists or not
    require(tokenURIExists[_tokenURI] == 0, "-5");
    // check if the token name already exists or not
    require(!tokenNameExists[_name], "-6");

    // mint the token
    _mint(msg.sender, newTokenID);
    // set token URI (bind token id with the passed in token URI)
    _setTokenURI(newTokenID, _tokenURI);

    // make passed token URI as exists
    tokenURIExists[_tokenURI] = newTokenID;
    // make token name passed as exists
    tokenNameExists[_name] = true;

    // creat a new pawning NFT (struct) and pass in new values
    PawnNFT memory newPawnNFT = PawnNFT(
      newTokenID,
      _name,
      _tokenURI,
      payable(msg.sender),
      payable(msg.sender),
      payable(address(0)),
      _price,
      0,
      true,
      false // mintedNativeToken
    );
    // add the token id and it's pawning NFT to all pawning NFTs mapping
    allPawnNFTs[newTokenID] = newPawnNFT;
    return newTokenID;
  }

  // get owner of the token
  function getTokenOwner(uint256 _tokenId) public view returns(address) {
    return ownerOf(_tokenId);
  }

  // get metadata of the token
  function getTokenMetaData(uint _tokenId) public view 
  returns(string memory tokenMetaData) {
    tokenMetaData = tokenURI(_tokenId);
  }

  function setMintedNativeToken(uint256 _tokenId, bool _mintedNativeToken) public {
    require(allPawnNFTs[_tokenId].tokenId > 0, "-7");
    allPawnNFTs[_tokenId].mintedNativeToken = _mintedNativeToken;
  }

  // get total number of tokens minted so far
  function getNumberOfTokensMinted() public view 
  returns(uint256 totalNumberOfTokensMinted) {
    totalNumberOfTokensMinted = totalSupply();
  }

  // get total number of tokens owned by an address
  function getTotalNumberOfTokensOwnedByAnAddress(address _owner) public view 
  returns(uint256 totalNumberOfTokensOwned) {
    totalNumberOfTokensOwned = balanceOf(_owner);
  }

  // check if the token already exists
  function getTokenExists(uint256 _tokenId) public view returns(bool) {
    bool tokenExists = _exists(_tokenId);
    return tokenExists;
  }

  // by a token by passing in the token's id
  function buyToken(uint256 _tokenId) public payable 
  onlyValidCaller onlyTokenOwner(_tokenId) {
    // get that token from all pawning NFTs mapping and create a memory of it defined as (struct => PawnNFT)
    PawnNFT memory pawnNft = allPawnNFTs[_tokenId];
    // price sent in to buy should be equal to or more than the token's price
    require(msg.value >= pawnNft.price, "-12");
    // token should be for sale
    require(pawnNft.forSale, "-13");
    // transfer the token from owner to the caller of the function (buyer)
    address tokenOwner = ownerOf(_tokenId);
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
      address /*from*/,
      address to,
      uint256 tokenId
  ) internal virtual override {
    // Now the owner of the token ID is "to"
    require(ERC721.ownerOf(tokenId) == to, "-14");
    require(to != address(0), "-15");

    // update token's owner
    PawnNFT memory pawnNft = allPawnNFTs[tokenId];
    // update the token's previous owner
    pawnNft.previousOwner = pawnNft.currentOwner;
    // update the token's current owner
    pawnNft.currentOwner = payable(to);
    // set and update that token in the mapping
    allPawnNFTs[tokenId] = pawnNft;
  }

  function changeTokenPrice(uint256 _tokenId, uint256 _newPrice) public 
  onlyValidCaller onlyTokenOwner(_tokenId) {
    // get that token from all pawning NFTs mapping and create a memory of it defined as (struct => PawnNFT)
    PawnNFT memory pawnNft = allPawnNFTs[_tokenId];
    // update token's price with new price
    pawnNft.price = _newPrice;
    // set and update that token in the mapping
    allPawnNFTs[_tokenId] = pawnNft;
  }

  // switch between set for sale and set not for sale
  function toggleForSale(uint256 _tokenId) public 
  onlyValidCaller onlyTokenOwner(_tokenId) {
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
