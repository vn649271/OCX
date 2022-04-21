// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./OcxBase.sol";
import "./IOcxPriceOracle.sol";

/*
 * -2: mint(): Error: caller of zero address
 * -3: Too small price
 * -4: PawnNFTs.mint(): The token id already exists
 * -5: PawnNFTs.mint(): The token URI already exists
 * -6: PawnNFTs.mint(): The token name already exists
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
contract PawnNFTs is ERC721, OcxBase {

  // total number of pawning NFTs minted
  uint256 private totalSupply;

  uint8   public decimals = 0;
  
  // define pawning NFT struct
  struct PawnNFT {
    uint256 tokenId;
    string tokenName;
    string tokenURI;
    // address payable mintedBy;
    address payable currentOwner;
    address payable previousOwner;
    uint256 price;
    uint256 fee;
    uint256 numberOfTransfers;
    bool forSale;
  }

  // map pawnNft's token id to pawning NFT
  mapping(uint256 => PawnNFT) public allPawnNFTs;
  // 
  // mapping(uint256 => string) public tokenURIs;
  // check if token name exists
  mapping(string => bool) public tokenNameExists;
  // check if token URI exists
  mapping(string => uint256) public tokenURIExists;

  receive() external payable {}

  // initialize contract while deployment with contract's collection name and token
  constructor() ERC721("Openchain Pawning NFT", "PNFT") {
    // collectionName = name();
    // collectionNameSymbol = symbol();
  }

  modifier onlyTokenOwner(uint256 _tokenId) virtual {
    // check if the token id of the token being bought exists or not
    require(_exists(_tokenId), "-9");
    // sender should not be an zero address account
    require(ownerOf(_tokenId) == msg.sender, "-11");
    _;
  }
  // mint a new pawning NFT and return token ID
  function mint(string memory _name, string memory _tokenURI, uint256 _price) external 
  onlyValidCaller returns(uint256 newTokenID, uint256 realOcats, uint256 mintFee) {
    // increment counter
    totalSupply++;
    newTokenID = totalSupply;
    // check if a token exists with the above token id => incremented counter
    require(!_exists(newTokenID), "-4");

    // check if the token URI already exists or not194
    require(tokenURIExists[_tokenURI] == 0, "-5");
    // check if the token name already exists or not
    require(!tokenNameExists[_name], "-6");

    // mint the token
    _safeMint(msg.sender, newTokenID);
    // // set token URI (bind token id with the passed in token URI)
    // tokenURIs[newTokenID] = _tokenURI;

    // make passed token URI as exists
    tokenURIExists[_tokenURI] = newTokenID;
    // make token name passed as exists
    tokenNameExists[_name] = true;

    (uint64 applicationFee, uint64 valuationFee) = 
      IOcxPriceOracle(ocxPriceOracleAddress).getSubmitFee();
    mintFee = convertToOcat(applicationFee + valuationFee);
    realOcats = convertToOcat(_price - mintFee);
    // creat a new pawning NFT (struct) and pass in new values
    allPawnNFTs[newTokenID] = PawnNFT(
      newTokenID,
      _name,
      _tokenURI,
      // payable(msg.sender),
      payable(msg.sender),
      payable(address(0)),
      realOcats,
      mintFee, // Default fee, can changed by admin later
      0,    // number of transfers
      true // for sale
    );
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
  // check if the token already exists
  function exists(uint256 _tokenId) public view returns(bool tokenExists) {
    tokenExists = _exists(_tokenId);
  }
  // by a token by passing in the token's id
  function buyToken(uint256 _tokenId) public payable 
  onlyValidCaller {
    // price sent in to buy should be equal to or more than the token's price
    require(msg.value >= allPawnNFTs[_tokenId].price, "-12");
    // token should be for sale
    require(allPawnNFTs[_tokenId].forSale, "-13");
    // transfer the token from owner to the caller of the function (buyer)
    _transfer(ownerOf(_tokenId), msg.sender, _tokenId);
    // send token's worth of ethers to the owner
    allPawnNFTs[_tokenId].currentOwner.transfer(msg.value);
    // update the token's previous owner
    allPawnNFTs[_tokenId].previousOwner = allPawnNFTs[_tokenId].currentOwner;
    // update the token's current owner
    allPawnNFTs[_tokenId].currentOwner = payable(msg.sender);
    // update the how many times this token was transfered
    allPawnNFTs[_tokenId].numberOfTransfers += 1;
  }
  function _afterTokenTransfer(
      address /*from*/,
      address to,
      uint256 tokenId
  ) internal virtual override {
    // Now the owner of the token ID is "to"
    require(ERC721.ownerOf(tokenId) == to, "-14");
    require(to != address(0), "-15");

    // update the token's previous owner
    allPawnNFTs[tokenId].previousOwner = allPawnNFTs[tokenId].currentOwner;
    // update the token's current owner
    allPawnNFTs[tokenId].currentOwner = payable(to);
    allPawnNFTs[tokenId].numberOfTransfers += 1;
  }
  function changeTokenPriceAndFee(uint256 _tokenId, uint256 _newPrice, uint256 _fee) public 
  // onlyTokenOwner(_tokenId) {
  onlyAdmin 
  {
    // update token's price with new price
    allPawnNFTs[_tokenId].price = _newPrice;
    allPawnNFTs[_tokenId].fee = _fee;
  }
  // switch between set for sale and set not for sale
  function toggleForSale(uint256 _tokenId) public 
  onlyTokenOwner(_tokenId) {
    // if token's forSale is false make it true and vice versa
    allPawnNFTs[_tokenId].forSale = !(allPawnNFTs[_tokenId].forSale);
  }
}
