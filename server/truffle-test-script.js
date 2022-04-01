// Test OcxLocalPool.addLiquidity()
let deployerAddress = "0x8248E4ab42316b41408B1DA6341c1DeFff35AB34";
let testerAddress = "0x82919a8F7B3E052d4e53BBA5298e621276e8Da3C";
let ocx = await OcxLocalPool.deployed();
let weth = await WEthToken.deployed();
let ocat = await OcatToken.deployed();
let wethAllowedAmount = web3.utils.toHex(10 * (10 ** 18));
await weth.approve(ocx.address, wethAllowedAmount);
let ocatAllowedAmount = web3.utils.toHex(100 * (10 ** 18));
await ocat.approve(ocx.address, ocatAllowedAmount);
await ocx.addLiquidity([weth.address, ocat.address], [wethAllowedAmount, ocatAllowedAmount])
let ocxWethBalance = (await weth.balanceOf(ocx.address)).toString();
web3.utils.fromWei(ocxWethBalance, "ether");
let ocxOcatBalance = (await ocat.balanceOf(ocx.address)).toString();
web3.utils.fromWei(ocxOcatBalance, "ether");

// Fund 50 OCAT to tester: "0x82919a8F7B3E052d4e53BBA5298e621276e8Da3C"
let ocatFundAmount = web3.utils.toHex(50 * (10 ** 18));
await ocat.transfer(testerAddress, ocatFundAmount);
let fundedOcatAmount = (await ocat.balanceOf(testerAddress)).toString(); 
web3.utils.fromWei(fundedOcatAmount, "ether");

// // Fund 100 WETH to "0x82919a8F7B3E052d4e53BBA5298e621276e8Da3C" from 
// let wethFundAmount = web3.utils.toHex(100 * (10 ** 18));
// await weth.transfer(ocx.address, wethFundAmount);
// let fundedWethAmount = (await weth.balanceOf(ocx.address)).toString(); 
// web3.utils.fromWei(fundedWethAmount, "ether");

// Close truffle console

//******************************************************************************
// Test ocxLocalPool.swapOcatToEth()
// 1. Uncomment networks.ganache.from line in truffle-config.js to set sender to "0x82919a8F7B3E052d4e53BBA5298e621276e8Da3C"
// 2. Run "truffle console --network ganache" again
// (await weth.balanceOf("0x8248E4ab42316b41408B1DA6341c1DeFff35AB34")).toString();
// (await ocat.balanceOf("0x8248E4ab42316b41408B1DA6341c1DeFff35AB34")).toString(); 

// Verify balances of OCAT for tester account: 0x82919a8F7B3E052d4e53BBA5298e621276e8Da3C
let ocat = await OcatToken.deployed();
let deployerAddress = "0x8248E4ab42316b41408B1DA6341c1DeFff35AB34";
let testerAddress = "0x82919a8F7B3E052d4e53BBA5298e621276e8Da3C";
let testerOcatBalanceInWei = (await ocat.balanceOf(testerAddress)).toString(); 
web3.utils.fromWei(testerOcatBalanceInWei, "ether");

// Try to OcxLocalPool.swapOcatToEth()
let ocx = await OcxLocalPool.deployed();
let ocatAllowedAmount = web3.utils.toHex(49 * (10 ** 18));
await ocat.approve(ocx.address, ocatAllowedAmount);
await ocx.swapOcatToEth(ocatAllowedAmount, 0, testerAddress, 10000000000000);
// Verify balance of OCAT for the deployer account: 0x8248E4ab42316b41408B1DA6341c1DeFff35AB34
(await ocat.balanceOf(deployerAddress)).toString()
web3.utils.fromWei(ocatDeployerBalance.toString(), "ether")