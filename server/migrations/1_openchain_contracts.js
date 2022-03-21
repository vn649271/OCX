const PawnNFTs = artifacts.require("./PawnNFTs.sol");
const OcatToken = artifacts.require("./OcatToken.sol");
const OcdSwap = artifacts.require("./OcdSwap.sol");

module.exports = async deployer => {
  var pnftAddress = 0;
  deployer.deploy(PawnNFTs).then(ret => {
    pnftAddress = ret.address;
  });
  var ocatAddress = 0;
  deployer.deploy(OcatToken).then(ret => {
    ocatAddress = ret.address;
  });
  deployer.deploy(OcdSwap).then(async ret => {
    console.log("******************* PNFT: ", pnftAddress);
    console.log("******************* OCAT: ", ocatAddress);
    console.log("******************* OcdSwap: ", ret.address);
    // Setting deployed PNFT address 
    await ret.setPnftAddress(pnftAddress);
    // Setting deployed OCAT address 
    await ret.setOcatAddress(ocatAddress);
  });
};
