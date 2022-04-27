// Test OcxLocalPool.addLiquidity()
let accounts = await web3.eth.getAccounts();
let ocat = await OcatToken.deployed();
let ocx = await OcxToken.deployed();

let ocatAllowedAmount = "1000000000000" // 1000 OCAT
ocat.mint(ocatAllowedAmount) // Mint 1000 OCAT
let ocxAllowedAmount = "100000000000000" // 100000 OCX
ocx.mint(ocxAllowedAmount) // Mint 100000 OCX
let ocxLocalPool = await OcxLocalPool.deployed();
let deployerAddress = accounts[0];
let lpAddress = accounts[1];
// Approve 1000 OCAT
await ocat.approve(ocxLocalPool.address, ocatAllowedAmount);
// Approve 100000 OCX
await ocx.approve(ocxLocalPool.address, ocxAllowedAmount);
// Fund 1000 OCAT + 100000 OCX into OcxLocalPool
await ocxLocalPool.addLiquidity([ocat.address, ocx.address], [ocatAllowedAmount, ocxAllowedAmount]);
// 50 OCAT --> ? OCX
let ocatSwapAmount = await web3.utils.toWei("50", "nano");
let expectedOcatSwapAmount = await ocxLocalPool.getAmountOutWithExactAmountIn([ocat.address, ocx.address], ocatSwapAmount);
await web3.utils.fromWei(expectedOcatSwapAmount.toString(), "nano");
// 500 OCX --> ? OCAT
let ocxSwapAmount = await web3.utils.toWei("500", "nano");
let expectedOcxSwapAmount = await ocxLocalPool.getAmountOutWithExactAmountIn([ocx.address, ocat.address], ocxSwapAmount);
await web3.utils.fromWei(expectedOcxSwapAmount.toString(), "nano");

let ocatBalance = (await ocat.balanceOf(ocxLocalPool.address)).toString();
await web3.utils.fromWei(ocatBalance, "nano");
let ocxBalance = (await ocx.balanceOf(ocxLocalPool.address)).toString();
await web3.utils.fromWei(ocxBalance, "nano");

let quoteObj = await ocxLocalPool.getQuote([ocat.address, ocx.address]);
quoteObj.value.toString() / (10**quoteObj.decimals.toString())

// Mint and swap 50 OCAT
ocat.mint(ocatSwapAmount) // Mint 50 OCAT

let expectedOcatAmount = await ocxLocalPool.getExactAmountOut([ocat.address, ocx.address], "500");

await ocat.approve(ocxLocalPool.address, ocatSwapAmount);
ocxLocalPool.swap([ocat.address, ocx.address], ocatSwapAmount, "0", "0");
quoteObj = await ocxLocalPool.getQuote([ocat.address, ocx.address]);
quoteObj.value.toString() / (10**quoteObj.decimals.toString())

ocatBalance = (await ocat.balanceOf(ocxLocalPool.address)).toString();
await web3.utils.fromWei(ocatBalance, "nano");
// 1050
ocxBalance = (await ocx.balanceOf(ocxLocalPool.address)).toString();
await web3.utils.fromWei(ocxBalance, "nano");
// 95238.095238095
ocxBalance = (await ocx.balanceOf(deployerAddress)).toString();
await web3.utils.fromWei(ocxBalance, "nano"); 
// 4761.904761905
// As result, Swapped 50 OCAT ==>> 4761.904761905 OCX
ocatBalance = (await ocat.balanceOf(deployerAddress)).toString();
await web3.utils.fromWei(ocatBalance, "nano"); 
// 0
