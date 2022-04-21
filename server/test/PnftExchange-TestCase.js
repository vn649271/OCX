let accounts = await web3.eth.getAccounts();
let ocat = await OcatToken.deployed();
let pnft = await PawnNFTs.deployed()
let pawnExchange = await PawnExchange.deployed()
let ocxPriceOracle = await OcxPriceOracle.deployed()
let ocxLocalPool = await OcxLocalPool.deployed()

// await web3.eth.getBalance(accounts[0]);
await pnft.mint("ccc", "https://aaaa.aaaaaa", "10000")
await pnft.approve(pawnExchange.address, "1")
await pawnExchange.exchangeToOcat("1");
(await ocat.balanceOf(accounts[1])).toString() // => 9950
(await ocat.balanceOf(pawnExchange.address)).toString() // => 50
ocat.approve(pawnExchange.address, "9850000000000");
await pawnExchange.exchangeFromOcat("1");

await pnft.mint("bbb", "https://bbb.bbb", "50000")
pnft.approve(pawnExchange.address, "2")
await pawnExchange.exchangeToOcat("2");
(await ocat.balanceOf(accounts[0])).toString()