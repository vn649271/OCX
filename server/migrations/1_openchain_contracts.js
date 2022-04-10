const WEthToken = artifacts.require("./WEthToken.sol");
const GDaiToken = artifacts.require("./GDaiToken.sol");
const GUniToken = artifacts.require("./GUniToken.sol");
const OcxLPToken = artifacts.require("./OcxLPToken.sol");
const PawnNFTs = artifacts.require("./PawnNFTs.sol");
const OcatToken = artifacts.require("./OcatToken.sol");
const OcxExchange = artifacts.require("./OcxExchange.sol");
const PawnExchange = artifacts.require("./PawnExchange.sol");
const OcxLocalPool = artifacts.require("./OcxLocalPool.sol");
const OcxPriceOracle = artifacts.require("./OcxPriceOracle.sol");

module.exports = async deployer => {
  // console.log("%%%%%%%%%%%%%%% deployer: ", deployer);
    var wethAddress = null;
    var gdaiAddress = null;
    var guniAddress = null;
    var ocxlpAddress = null;
    var ocatAddress = null;
    var ocatToken = null;
    var ocxLocalPoolAddress = null;
    var pawnExchangeAddress = null;
    var pawnExchange = null;
    var pnftAddress = null;
    var ocxPriceOracleAddress = null;

    // if (deployer.network == "ganache") {
    //     deployer.deploy(WEthToken).then(ocxExchange => {
    //         wethAddress = ret.address;
    //     });
    //     deployer.deploy(GDaiToken).then(ret => {
    //         gdaiAddress = ret.address;
    //     });
    //     deployer.deploy(GUniToken).then(ret => {
    //         guniAddress = ret.address;
    //     });
    // }
    deployer.deploy(OcatToken).then(ret => {
        ocatToken = ret;
        ocatAddress = ret.address;
    });
    // // deployer.deploy(OcxLPToken).then(ret => {
    // //   ocxlpAddress = ret.address;
    // //   // // Setting deployed OCAT address 
    // //   // await ret.setOcxPoolAddress(ocxLocalPoolAddress);
    // // });
    // deployer.deploy(OcxPriceOracle).then(ret => {
    //     ocxPriceOracleAddress = ret.address;
    // });
    deployer.deploy(PawnNFTs).then(ret => {
        pnftAddress = ret.address;
    });

    deployer.deploy(PawnExchange).then(async ret => {
        pawnExchange = ret;
        pawnExchangeAddress = pawnExchange.address;
    });

    deployer.deploy(OcxLocalPool).then(async ret => {
        ocxLocalPoolAddress = ret.address;
        // Setting deployed OCAT address 
        await ret.setOcatAddress(ocatAddress);
        // Setting deployed OCAT address 
        // await ret.setOcxLPAddress(ocxlpAddress);
    });

    deployer.deploy(OcxExchange).then(async ocxExchange => {
        console.log("\n\n");
        if (deployer.network == "ganache") {
            console.log("    WETH: \"" + wethAddress + "\",");
            console.log("    DAI: \"" + gdaiAddress + "\",");
            console.log("    UNI: \"" + guniAddress + "\",");
        }
        console.log("    PNFT: \"" + pnftAddress + "\",");
        console.log("    OCAT: \"" + ocatAddress + "\",");
        console.log("    PAWN_EXCHANGE: \"" + pawnExchangeAddress + "\",");
        console.log("    OCX_LOCAL_POOL: \"" + ocxLocalPoolAddress + "\",");
        console.log("    OCX_PRICE_ORACLE: \"" + ocxPriceOracleAddress + "\",");
        console.log("    OCX_EXCHANGE: \"" + ocxExchange.address + "\"");
        console.log("\n\n");
        // Setting deployed OCAT address 
        await pawnExchange.setOcatAddress(ocatAddress);
        // Setting deployed PNFT address 
        await pawnExchange.setPnftAddress(pnftAddress);
        // Add PawnExchange contract to OcatToken contract as an operator
        await ocatToken.addOperator(pawnExchangeAddress);
        // Setting deployed PNFT address 
        await ocxExchange.setPnftAddress(pnftAddress);
        // Setting deployed OCAT address 
        await ocxExchange.setOcatAddress(ocatAddress);
        // Setting deployed Ocx local pool address 
        await ocxExchange.setOcxLocalPoolAddress(ocxLocalPoolAddress);
    });
};
