let accounts = await web3.eth.getAccounts();
await web3.eth.getBalance(accounts[0]);
let ocat = await OcatToken.deployed();
await ocat.getAllowedOperators();

let pnfts = await PawnNFTs.deployed()
await pnfts.mintPawnNFT("aaa", "https://aaaa.aaaaaa", "10000")
let pnftExchange = await PawnExchange.deployed()
await pnfts.approve(pnftExchange.address, "1")
await pnftExchange.exchangeToOcat("1");
(await ocat.balanceOf(accounts[0])).toString() // => 9950
(await ocat.balanceOf(pnftExchange.address)).toString() // => 50

await pnfts.mintPawnNFT("bbb", "https://bbb.bbb", "50000")
pnfts.approve(pnftExchange.address, "2")
await pnftExchange.exchangeToOcat("2");
(await ocat.balanceOf(accounts[0])).toString()