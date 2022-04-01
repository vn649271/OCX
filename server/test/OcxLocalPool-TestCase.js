// Test OcxLocalPool.addLiquidity()
let deployerAddress = "0x8248E4ab42316b41408B1DA6341c1DeFff35AB34";
let lpAddress = "0x82919a8F7B3E052d4e53BBA5298e621276e8Da3C";
let ocx = await OcxLocalPool.deployed();
let ocat = await OcatToken.deployed();
// let weth = await WEthToken.deployed();
// let wethAllowedAmount = web3.utils.toHex(10 * (10 ** 18));

// await weth.approve(ocx.address, wethAllowedAmount);
let ocatAllowedAmount = web3.utils.toHex(100 * (10 ** 18));
await ocat.approve(ocx.address, ocatAllowedAmount);

// Test addLiquidity()
// await ocx.addLiquidity([weth.address, ocat.address], [wethAllowedAmount, ocatAllowedAmount])

// Test addLiquidityWithETH()
// Check previous ETH balance of OcxLocalPool
let ocxEthBalance = await web3.eth.getBalance(ocx.address);
await web3.utils.fromWei(ocxEthBalance, "ether");
// = 0
// Fund 5 ETH + 100 OCAT into OcxLocalPool
let ethAmount = await web3.utils.toWei("5", "ether");
await ocx.addLiquidityWithETH(ocat.address, ocatAllowedAmount, {value: ethAmount});
ocxEthBalance = await web3.eth.getBalance(ocx.address);
await web3.utils.fromWei(ocxEthBalance, "ether");
// = 5 ETH
let ocxOcatBalance = (await ocat.balanceOf(ocx.address)).toString();
web3.utils.fromWei(ocxOcatBalance, "ether");
// = 100 OCAT
// Fund 50 OCAT to tester: "0x82919a8F7B3E052d4e53BBA5298e621276e8Da3C"
let ocatFundAmount = web3.utils.toHex(50 * (10 ** 18));
await ocat.transfer(lpAddress, ocatFundAmount);
let fundedOcatAmount = (await ocat.balanceOf(lpAddress)).toString(); 
web3.utils.fromWei(fundedOcatAmount, "ether");
// = 50
// // Fund 100 WETH to "0x82919a8F7B3E052d4e53BBA5298e621276e8Da3C" from 
// let wethFundAmount = web3.utils.toHex(100 * (10 ** 18));
// await weth.transfer(ocx.address, wethFundAmount);
// let fundedWethAmount = (await weth.balanceOf(ocx.address)).toString(); 
// web3.utils.fromWei(fundedWethAmount, "ether");

// Close truffle console

//******************************************************************************
// Test ocxLocalPool.swapOcatToEth()
// 1. Uncomment networks.ganache.from line in truffle-config.js to set sender to 
//      "0x82919a8F7B3E052d4e53BBA5298e621276e8Da3C"
// 2. Run "truffle console --network ganache" again
// (await weth.balanceOf("0x8248E4ab42316b41408B1DA6341c1DeFff35AB34")).toString();
// (await ocat.balanceOf("0x8248E4ab42316b41408B1DA6341c1DeFff35AB34")).toString(); 

// Verify balances of OCAT for tester account: 0x82919a8F7B3E052d4e53BBA5298e621276e8Da3C
let ocx = await OcxLocalPool.deployed();
let ocat = await OcatToken.deployed();
let deployerAddress = "0x8248E4ab42316b41408B1DA6341c1DeFff35AB34";
let lpAddress = "0x82919a8F7B3E052d4e53BBA5298e621276e8Da3C";
// let weth = await WEthToken.deployed();

let lpOcatBalanceInWei = (await ocat.balanceOf(lpAddress)).toString(); 
web3.utils.fromWei(lpOcatBalanceInWei, "ether");
// = 50 OCAT
//****************************************************************************
// Try to OcxLocalPool.swapOcatToEth()
//****************************************************************************
// Add 10 OCAT into the pool
let ocatAllowedAmount = await web3.utils.toWei("10", "ether");
await ocat.approve(ocx.address, ocatAllowedAmount);

let lpEthBalance = (await web3.eth.getBalance(lpAddress)).toString();
web3.utils.fromWei(lpEthBalance.toString(), "ether");
// 82.010752689090909092 ETH
let ocxEthBalanceInWei = (await web3.eth.getBalance(ocx.address)).toString(); 
web3.utils.fromWei(ocxEthBalanceInWei, "ether");
// = 5 ETH
let ret = await ocx.swapOcatToEth(ocatAllowedAmount, 0, lpAddress, 10000000000000);
// Verify balance of ETH and OCAT in the tester account and OcxLocalPool
let lpOcatBal = (await ocat.balanceOf(lpAddress)).toString();
web3.utils.fromWei(lpOcatBal.toString(), "ether");
// = 40 OCAT
let ocxOcatBal = (await ocat.balanceOf(ocx.address)).toString();
web3.utils.fromWei(ocxOcatBal.toString(), "ether");
// 110 OCAT
lpEthBalance = (await web3.eth.getBalance(lpAddress)).toString();
web3.utils.fromWei(lpEthBalance.toString(), "ether");
// = 82.463192363636363638 ETH => 82.010752689090909092 + 0.4545454545 - 0.003(Fee) ETH
ocxEthBalanceInWei = (await web3.eth.getBalance(ocx.address)).toString(); 
web3.utils.fromWei(ocxEthBalanceInWei, "ether");
// 500/110 = 4.545454545454545454 OCAT
//****************************************************************************
// Try to OcxLocalPool.swapEthToOcat()
//****************************************************************************
// Add 2 ETH into the pool
let ethToSwap = await web3.utils.toWei("2", "ether");
ret = await ocx.swapEthToOcat(0, lpAddress, 10000000000000, {value: ethToSwap});
lpOcatBal = (await ocat.balanceOf(lpAddress)).toString()
web3.utils.fromWei(lpOcatBal.toString(), "ether")
// = 73.611111111111111105 OCAT
ocxOcatBal = (await ocat.balanceOf(ocx.address)).toString()
web3.utils.fromWei(ocxOcatBal.toString(), "ether")
// = 76.388888888888888895 OCAT
let ocxEthBalance = await web3.eth.getBalance(ocx.address);
await web3.utils.fromWei(ocxEthBalance, "ether");
// = 6.545454545454545454
