// const PawnNFTs = artifacts.require("./PawnNFTs.sol");
// const OcatToken = artifacts.require("./OcatToken.sol");
// const GDaiToken = artifacts.require("./GDaiToken.sol");
// const GUniToken = artifacts.require("./GUniToken.sol");
const OcxExchange = artifacts.require("./OcxExchange.sol");

module.exports = async deployer => {
  var gdaiAddress = null;
  var guniAddress = null;
  var ocatAddress = null;
  var pnftAddress = null;
  // deployer.deploy(GDaiToken).then(ret => {
  //   gdaiAddress = ret.address;
  // });
  // deployer.deploy(GUniToken).then(ret => {
  //   guniAddress = ret.address;
  // });
  // deployer.deploy(OcatToken).then(ret => {
  //   ocatAddress = ret.address;
  // });
  // deployer.deploy(PawnNFTs).then(ret => {
  //   pnftAddress = ret.address;
  // });
  // var ocatAddress = 0;
  // deployer.deploy(OcatToken).then(ret => {
  //   ocatAddress = ret.address;
  // });
  deployer.deploy(OcxExchange).then(async ret => {
    console.log("******************* GDAI: ", gdaiAddress);
    console.log("******************* GUNI: ", guniAddress);
    console.log("******************* PNFT: ", pnftAddress);
    console.log("******************* OCAT: ", ocatAddress);
    console.log("******************* OcxExchange: ", ret.address);
    // Setting deployed PNFT address 
    // await ret.setPnftAddress(pnftAddress);
    // Setting deployed OCAT address 
    // await ret.setOcatAddress(ocatAddress);
  });
};
