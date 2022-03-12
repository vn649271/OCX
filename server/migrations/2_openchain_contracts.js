const OpenchainContract = artifacts.require("./OpenchainContract.sol");

module.exports = (deployer) => {
  deployer.deploy(OpenchainContract);
};