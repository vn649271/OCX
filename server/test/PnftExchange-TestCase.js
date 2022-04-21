let accounts = await web3.eth.getAccounts();
// await web3.eth.getBalance(accounts[0]);
let ocat = await OcatToken.deployed();
let pnft = await PawnNFTs.deployed()
let pawnExchange = await PawnExchange.deployed()
let ocxPriceOracle = await OcxPriceOracle.deployed()

await pnft.mint("aaa", "https://aaaa.aaaaaa", "10000")
await pnft.approve(pawnExchange.address, "1")
await pawnExchange.exchangeToOcat("1");
(await ocat.balanceOf(accounts[0])).toString() // => 9950
(await ocat.balanceOf(pawnExchange.address)).toString() // => 50

await pnft.mint("bbb", "https://bbb.bbb", "50000")
pnft.approve(pawnExchange.address, "2")
await pawnExchange.exchangeToOcat("2");
(await ocat.balanceOf(accounts[0])).toString()