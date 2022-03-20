const ERC20Swap = artifacts.require("./ERC20Swap.sol");
const PawnNFTs = artifacts.require("./PawnNFTs.sol");
const OcatToken = artifacts.require("./OcatToken.sol");
// const PawnExchange = artifacts.require("./PawnExchange.sol");
// const PawningContract = artifacts.require("./PawningContract.sol");

module.exports = (deployer) => {
  deployer.deploy(ERC20Swap);
  deployer.deploy(PawnNFTs);
  deployer.deploy(OcatToken);
  // deployer.deploy(PawnExchange);
  // deployer.deploy(PawningContract);
};
