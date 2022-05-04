// const WEthToken = artifacts.require("./ganache-token/WEthToken.sol");
// const GDaiToken = artifacts.require("./ganache-token/GDaiToken.sol");
// const GUniToken = artifacts.require("./ganache-token/GUniToken.sol");
// const OcatToken = artifacts.require("./OcatToken.sol");
// const OcxToken = artifacts.require("./OcxToken.sol");
// const PawnNFTs = artifacts.require("./PawnNFTs.sol");
const OcxExchange = artifacts.require("./OcxExchange.sol");
// const PawnExchange = artifacts.require("./PawnExchange.sol");
// const OcxPriceOracle = artifacts.require("./OcxPriceOracle.sol");
// // const OcxLocalPool = artifacts.require("./OcxLocalPool.sol");
// const OcxBalancer = artifacts.require("./balancer/OcxBalancer.sol");
// const OcxOcatEthPool = artifacts.require("./balancer/OcxOcatEthPool.sol");

module.exports = async deployer => {
  // console.log("%%%%%%%%%%%%%%% deployer: ", deployer);
    var weth = null;
    var wethAddress = null;
    var gdai = null;
    var gdaiAddress = null;
    var guni = null;
    var guniAddress = null;
    var ocxlp = null;
    var ocxAddress = "0x03c694f8786E75e9dB9FD5EC67d6550430F58CaD";
    var ocxToken = null;
    var ocatAddress = "0x031bc87a988cc288D74D676FCa1EDF649b08f72f";
    var ocatToken = null;
    var ocxLocalPoolAddress = "0xE6493296FD87C0f83Cd809F2a8788A03093Cdd3A";
    var ocxLocalPool = null;
    var pawnExchangeAddress = "0xD5F87244a36342E1dBf7EF685B2E2fC194f9076d";
    var pawnExchange = null;
    var pnftAddress = "0x5373E474Fdf8A6c4B11f25ef0C5E693386EdFCe0";
    var pnft = null;
    var ocxPriceOracleAddress = "0xcf00bD00a8044a673Bd0C1263e001c9431f8f18c";
    var ocxPriceOracle = null;
    var ocxBalancerAddress = "";
    var ocxBalancer = null;
    var ocxExchangeAddress = "0xf0B1281ab662e0B933181Ac7923D46aE5969C744";
    var ocxExchange = null;
    var ocxFeeManagerAddress = "0xc6e523EE327AB5d381c2D4F4188568377Ea87Cd4";
    var ocxFeeManager = null;
    var ocxOcatEthPoolAddress = null;
    var ocxOcatEthPool = null;
    var adminAddress = "0xADB366C070DFB857DC63ebF797EFE615B0567C1B";

    // deployer.deploy(PawnNFTs).then(ret => {
    //     pnftAddress = ret.address;
    //     pnft = ret;
    // });

    // deployer.deploy(OcatToken).then(ret => {
    //     ocatToken = ret;
    //     ocatAddress = ret.address;
    // });
    // deployer.deploy(OcxToken).then(ret => {
    //   ocxAddress = ret.address;
    //   // // Setting deployed OCAT address 
    //   // await ret.setOcxPoolAddress(ocxLocalPoolAddress);
    // });
    // deployer.deploy(PawnExchange).then(ret => {
    //     pawnExchange = ret;
    //     pawnExchangeAddress = pawnExchange.address;
    // });

    // // deployer.deploy(OcxLocalPool).then(ret => {
    // //     ocxLocalPool = ret;
    // //     ocxLocalPoolAddress = ret.address;
    // // });

    // deployer.deploy(OcxPriceOracle).then(ret => {
    //     ocxPriceOracleAddress = ret.address;
    // });

    // // https://github.com/rafaelmrdyn/uniswap-v3-periphery/blob/main/testnet-deploys.md
    // //   NonfungibleTokenPositionManagerAddress: 0x865F20efC14A5186bF985aD42c64f5e71C055376 on Goerli
    // //   
    
    // deployer.deploy(OcxBalancer).then(ret => {
    //     ocxBalancer = ret;
    // });

    // // deployer.deploy(OcxOcatEthPool).then(ret => {
    // //     ocxOcatEthPoolAddress = ret.address;
    // // });

    deployer.deploy(OcxExchange).then(async ocxExchange => {

        // console.log("    PNFT: \"" + pnftAddress + "\",");
        // console.log("    OCAT: \"" + ocatAddress + "\",");
        // console.log("    OCX: \"" + ocxAddress + "\",");
        // console.log("    PAWN_EXCHANGE: \"" + pawnExchangeAddress + "\",");
        // console.log("    OCX_LOCAL_POOL: \"" + ocxLocalPoolAddress + "\",");
        // console.log("    OCX_PRICE_ORACLE: \"" + ocxPriceOracleAddress + "\",");
        // console.log("    OCX_EXCHANGE: \"" + ocxExchange.address + "\"");
        // console.log("    OCX_BALANCER: \"" + ocxBalancer.address + "\"");
        // console.log("\n\n");
    });

    // console.log("\n\n");
    // deployer.deploy(GUniToken).then(ret => {
    //     guni = ret;
    //     guniAddress = ret.address;
    //     console.log("    UNI: \"" + guniAddress + "\",");
    // });

    // if (deployer.network == "ganache") {
    //     deployer.deploy(WEthToken).then(ret => {
    //         weth = ret;
    //         wethAddress = ret.address;
    //         console.log("    WETH: \"" + wethAddress + "\",");
    //     });
    //     deployer.deploy(GDaiToken).then(ret => {
    //         gdai = ret;
    //         gdaiAddress = ret.address;
    //         console.log("    DAI: \"" + gdaiAddress + "\",");
    //     });
    // }
};
