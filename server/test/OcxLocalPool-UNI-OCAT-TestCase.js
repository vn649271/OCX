let accounts = await web3.eth.getAccounts();
let ocat = await OcatToken.deployed();
let uni = await GUniToken.deployed();

let ocatAllowedAmount = "1000000000000"; // 1000 OCAT
ocat.mint(ocatAllowedAmount) // Mint 1000 OCAT
let uniAllowedAmount = "100000000000000000000"; // 100 UNI
let ocxLocalPool = await OcxLocalPool.deployed();
let deployerAddress = accounts[0];
let lpAddress = accounts[1];
// Approve 1000 OCAT
await ocat.approve(ocxLocalPool.address, ocatAllowedAmount);
// Approve 100000 uni
await uni.approve(ocxLocalPool.address, uniAllowedAmount);
// Fund 1000 OCAT + 100000 uni into ocxLocalPool
await ocxLocalPool.addLiquidity([ocat.address, uni.address], [ocatAllowedAmount, uniAllowedAmount]);

let ocatSwapAmount = await web3.utils.toWei("50", "nano");
let expectedOcatSwapAmount = await ocxLocalPool.getAmountOutWithExactAmountIn([ocat.address, uni.address], ocatSwapAmount);
expectedOcatSwapAmount.toString()
await web3.utils.fromWei(expectedOcatSwapAmount.toString(), "ether");

// ? OCAT --> 5 UNI
let uniSwapAmount = await web3.utils.toWei("5", "ether");
let expectedUniSwapAmount = await ocxLocalPool.getAmountOutWithExactAmountIn([uni.address, ocat.address], uniSwapAmount);
await web3.utils.fromWei(expectedUniSwapAmount.toString(), "nano");

let ocatBalance = (await ocat.balanceOf(ocxLocalPool.address)).toString();
await web3.utils.fromWei(ocatBalance, "nano");
let uniBalance = (await uni.balanceOf(ocxLocalPool.address)).toString();
await web3.utils.fromWei(uniBalance, "nano");

let quoteObj = await ocxLocalPool.getQuote([ocat.address, uni.address]);
quoteObj.value.toString() / (10**quoteObj.decimals.toString())
