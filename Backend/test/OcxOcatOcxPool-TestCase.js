// Test OcxLocalPool.addLiquidity()
let accounts = await web3.eth.getAccounts();
// let ocat = await OcatToken.deployed();
let ocatAllowedAmount = "1000000000000"; // 1000 OCAT
ocat.mint(ocatAllowedAmount) // Mint 1000 OCAT
let ocatEthPool = await OcxOcatEthPool.deployed();
let deployerAddress = accounts[0];
let lpAddress = accounts[1];
// Approve 1000 OCAT
await ocat.approve(ocatEthPool.address, ocatAllowedAmount);
// Fund 10 ETH + 1000 OCAT into OcxLocalPool
let ethAmount = await web3.utils.toWei("10", "ether");
await ocatEthPool.addLiquidityWithEth(ocatAllowedAmount, {value: ethAmount});
ocxEthBalance = (await web3.eth.getBalance(ocatEthPool.address)).toString();
await web3.utils.fromWei(ocxEthBalance, "ether");
// = 10 ETH
let ocxOcatBalance = (await ocat.balanceOf(ocatEthPool.address)).toString();
web3.utils.fromWei(ocxOcatBalance, "nano");
// = 1000 OCAT
// Fund 50 OCAT to tester: "0x82919a8F7B3E052d4e53BBA5298e621276e8Da3C"
let ocatSwapAmount = await web3.utils.toWei("50", "nano");
ocat.mint(ocatSwapAmount) // Mint 1000 OCAT
await ocat.transfer(lpAddress, ocatSwapAmount);
let fundedOcatAmount = (await ocat.balanceOf(lpAddress)).toString(); 
web3.utils.fromWei(fundedOcatAmount, "nano");
// = 50
// // Fund 100 WETH to "0x82919a8F7B3E052d4e53BBA5298e621276e8Da3C" from 
// let wethFundAmount = web3.utils.toHex(100 * (10 ** 18));
// await weth.transfer(ocatEthPool.address, wethFundAmount);
// let fundedWethAmount = (await weth.balanceOf(ocatEthPool.address)).toString(); 
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
let ocatEthPool = await OcxOcatEth.deployed();
let ocat = await OcatToken.deployed();
let deployerAddress = "0x8248E4ab42316b41408B1DA6341c1DeFff35AB34";
let lpAddress = "0x82919a8F7B3E052d4e53BBA5298e621276e8Da3C";
// let weth = await WEthToken.deployed();

let lpOcatBalanceInNano = (await ocat.balanceOf(lpAddress)).toString(); 
web3.utils.fromWei(lpOcatBalanceInNano, "nano");
// = 50 OCAT
//****************************************************************************
// Try to OcxLocalPool.swapOcatToEth()
//****************************************************************************
// Add 10 OCAT into the pool
let ocatAllowedAmount = await web3.utils.toWei("10", "nano");
await ocat.approve(ocatEthPool.address, ocatAllowedAmount);

let lpEthBalance = (await web3.eth.getBalance(lpAddress)).toString();
web3.utils.fromWei(lpEthBalance.toString(), "ether");
// 82.010752689090909092, 
// 80.460732483636363638 ETH
let ocxEthBalanceInWei = (await web3.eth.getBalance(ocatEthPool.address)).toString(); 
web3.utils.fromWei(ocxEthBalanceInWei, "ether");
// = 5 ETH
let ret = await ocatEthPool.swapOcatToEth(ocatAllowedAmount, 0, lpAddress, 10000000000000);
// Verify balance of ETH and OCAT in the tester account and OcxLocalPool
let lpOcatBal = (await ocat.balanceOf(lpAddress)).toString();
web3.utils.fromWei(lpOcatBal.toString(), "ether");
// = 40 OCAT
let ocxOcatBal = (await ocat.balanceOf(ocatEthPool.address)).toString();
web3.utils.fromWei(ocxOcatBal.toString(), "ether");
// 110 OCAT
lpEthBalance = (await web3.eth.getBalance(lpAddress)).toString();
web3.utils.fromWei(lpEthBalance.toString(), "ether");
// = 82.463192363636363638 ETH => 82.010752689090909092 + 0,452357655 + 0.0021878(Fee) ETH
// = 80.913090138181818184 => 80.460732483636363638 + 0.452357655 + 0.0021878(Fee)
ocxEthBalanceInWei = (await web3.eth.getBalance(ocatEthPool.address)).toString(); 
web3.utils.fromWei(ocxEthBalanceInWei, "ether");
// 500/110 = 4.545454545454545454 OCAT
//****************************************************************************
// Try to OcxLocalPool.swapEthToOcat()
//****************************************************************************
// Add 5 ETH into the pool
let ethToSwap = await web3.utils.toWei("5", "ether");
ret = await ocatEthPool.swapEthToOcat(0, lpAddress, 10000000000000, {value: ethToSwap});
lpOcatBal = (await ocat.balanceOf(lpAddress)).toString()
web3.utils.fromWei(lpOcatBal.toString(), "ether")
// = 73.611111111111111105 OCAT
ocxOcatBal = (await ocat.balanceOf(ocatEthPool.address)).toString()
web3.utils.fromWei(ocxOcatBal.toString(), "ether")
// = 76.388888888888888895 OCAT
let ocxEthBalance = await web3.eth.getBalance(ocatEthPool.address);
await web3.utils.fromWei(ocxEthBalance, "ether");
// = 6.545454545454545454
