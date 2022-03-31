// Test OcxLocalPool.addLiquidity()
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
// Close truffle console

// Test ocxLocalPool.swapOcatToEth()
// 1. Uncomment networks.ganache.from line in truffle-config.js to set sender to "0x82919a8F7B3E052d4e53BBA5298e621276e8Da3C"
// 2. Run "truffle console --network ganache" again
// 3. Fund some OCAT to "0x82919a8F7B3E052d4e53BBA5298e621276e8Da3C" from 
(await weth.balanceOf("0x8248E4ab42316b41408B1DA6341c1DeFff35AB34")).toNumber();
(await ocat.balanceOf("0x8248E4ab42316b41408B1DA6341c1DeFff35AB34")).toNumber(); 
let ocatFundAmount = web3.utils.toHex(100 * (10 ** 18));
await ocat.transfer("0x82919a8F7B3E052d4e53BBA5298e621276e8Da3C", ocatFundAmount);
let fundedOcatAmount = (await ocat.balanceOf("0x82919a8F7B3E052d4e53BBA5298e621276e8Da3C")).toString(); 
web3.utils.fromWei(fundedOcatAmount, "ether");
await ocx.swapOcatToEth(50, 0, "0x82919a8F7B3E052d4e53BBA5298e621276e8Da3C", 10000000000000000)
(await ocat.balanceOf("0x8248E4ab42316b41408B1DA6341c1DeFff35AB34")).toString()
web3.utils.fromWei(ocatDeployerBalance.toString(), "ether")