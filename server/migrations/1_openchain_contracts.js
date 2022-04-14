const WEthToken = artifacts.require("./WEthToken.sol");
const GDaiToken = artifacts.require("./GDaiToken.sol");
const GUniToken = artifacts.require("./GUniToken.sol");
const OcatToken = artifacts.require("./OcatToken.sol");
// const OcxLPToken = artifacts.require("./OcxLPToken.sol");
const PawnNFTs = artifacts.require("./PawnNFTs.sol");
const OcxExchange = artifacts.require("./OcxExchange.sol");
const PawnExchange = artifacts.require("./PawnExchange.sol");
const OcxLocalPool = artifacts.require("./OcxLocalPool.sol");
const OcxPriceOracle = artifacts.require("./OcxPriceOracle.sol");
const OcxFeeManager = artifacts.require("./OcxFeeManager.sol");

module.exports = async deployer => {
  // console.log("%%%%%%%%%%%%%%% deployer: ", deployer);
    var weth = null;
    var wethAddress = null;
    var gdai = null;
    var gdaiAddress = null;
    var guni = null;
    var guniAddress = null;
    var ocxlp = null;
    var ocxlpAddress = null;
    var ocatAddress = null;
    var ocatToken = null;
    var ocxLocalPoolAddress = null;
    var pawnExchangeAddress = null;
    var pawnExchange = null;
    var pnft = null;
    var pnftAddress = null;
    var ocxPriceOracleAddress = null;
    var ocxExchange = null;
    var ocxFeeManager = null;
    var adminAddress = "0xADB366C070DFB857DC63ebF797EFE615B0567C1B";

    deployer.deploy(PawnNFTs).then(ret => {
        pnftAddress = ret.address;
        pnft = ret;
    });

    deployer.deploy(OcatToken).then(ret => {
        ocatToken = ret;
        ocatAddress = ret.address;
    });
    // deployer.deploy(OcxLPToken).then(ret => {
    //   ocxlpAddress = ret.address;
    //   // // Setting deployed OCAT address 
    //   // await ret.setOcxPoolAddress(ocxLocalPoolAddress);
    // });
    deployer.deploy(OcxPriceOracle).then(ret => {
        ocxPriceOracleAddress = ret.address;
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

    deployer.deploy(OcxFeeManager).then(async ret => {
        ocxFeeManager = ret
        // // Setting deployed OCAT address 
        // await ret.setOcatAddress(ocatAddress);
    });

    deployer.deploy(OcxExchange).then(async ocxExchange => {
        console.log("\n\n");
        if (deployer.network == "ganache") {
            deployer.deploy(WEthToken).then(ret => {
                weth = ret;
                wethAddress = ret.address;
            });
            deployer.deploy(GDaiToken).then(ret => {
                gdai = ret;
                gdaiAddress = ret.address;
            });
            deployer.deploy(GUniToken).then(ret => {
                guni = ret;
                guniAddress = ret.address;
            });
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
        // Setup deployed OCAT address 
        await pawnExchange.setOcatAddress(ocatAddress);
        // Setup deployed PNFT address 
        await pawnExchange.setPnftAddress(pnftAddress);
        // Setup fee manager
        await pawnExchange.setFeeManager(ocxFeeManager.address);
        // Setup administrator
        await pawnExchange.addAdmin(adminAddress);
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
