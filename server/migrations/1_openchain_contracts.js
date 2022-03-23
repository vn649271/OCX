const PawnNFTs = artifacts.require("./PawnNFTs.sol");
const OcatToken = artifacts.require("./OcatToken.sol");
const OcxSwap = artifacts.require("./OcxSwap.sol");

module.exports = async deployer => {
  var pnftAddress = 0;
  deployer.deploy(PawnNFTs).then(ret => {
    pnftAddress = ret.address;
  });
  var ocatAddress = 0;
  deployer.deploy(OcatToken).then(ret => {
    ocatAddress = ret.address;
  });
  deployer.deploy(OcxSwap).then(async ret => {
    console.log("******************* PNFT: ", pnftAddress);
    console.log("******************* OCAT: ", ocatAddress);
    console.log("******************* OcxSwap: ", ret.address);
    // Setting deployed PNFT address 
    await ret.setPnftAddress(pnftAddress);
    // Setting deployed OCAT address 
    await ret.setOcatAddress(ocatAddress);
  });
};
