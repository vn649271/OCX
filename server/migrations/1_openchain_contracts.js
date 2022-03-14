const ERC20Swap = artifacts.require("./ERC20Swap.sol");
const PawnNFT = artifacts.require("./PawnNFT.sol");
const OcatToken = artifacts.require("./OcatToken.sol");
const PawnExchange = artifacts.require("./PawnExchange.sol");

module.exports = (deployer) => {
  deployer.deploy(ERC20Swap);
  deployer.deploy(PawnNFT);
  deployer.deploy(OcatToken);
  deployer.deploy(PawnExchange);
};