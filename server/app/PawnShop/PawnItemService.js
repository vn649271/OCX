var util = require('util');
require('dotenv').config();
const PawnItemModel = require("./PawnItemModel");
const { OpenchainTransactions, DEFAULT_DEADLINE } = require('../Services/Uniswap/OpenchainTransactions');
var { getWeb3Obj, MSG__GETH_NOT_READY } = require('../Services/geth/init');

var self = null;
var web3 = null;
initWeb3 = (inited) => {
    web3 = inited;
}

var pawnItemModel = new PawnItemModel();

/**
 * Controller for user authentication
 */
class PawnItemService {

    constructor() {
        self = this;
        this.gethError = null
        setTimeout(getWeb3Obj, 12000, initWeb3);
    }

    /**
     * @param {object} newPawnItemObj list of symbols for getting info of
     */
    async mint(params) {
        if (web3 == null) {
            console.log("PawnItemService.mint(): Geth node is not ready yet. Please retry a while later.");
            return { error: -200, data: MSG__GETH_NOT_READY };
        }
        var accountInfo = params ? params.accountInfo ? params.accountInfo : null : null;
        if (accountInfo.addresses == undefined || accountInfo.addresses == {}) {
            return { error: -201, data: "No account for you" };
        }
        var addresses = accountInfo.addresses;
        if (addresses['ETH'] === undefined || addresses['ETH'] === null) {
            return { error: -206, data: "Invalid your address for swapping" };
        }
        var myAddress = addresses['ETH'];
        if (process.env.BLOCKCHAIN_EMULATOR == "ganache") {
            var accounts = await web3.eth.personal.getAccounts();
            myAddress = accounts[0];
        }

        // Get Uri for uploaded item
        var assetId = params ? params.assetId : null;
        if (!assetId) {
            return { error: -207, data: "Invalid asset information to mint pawn NFT" };
        }
        await web3.eth.accounts.wallet.add({
            privateKey: accountInfo.secret_keys['ETH'], // ownerPrivKey,
            address: myAddress, // ownerAddr,
        });
        var assetInfo = await pawnItemModel.getById(assetId);
        if (!assetInfo) {
            return { error: -208, data: "Invalid asset information to the specified ID" };
        }
        const openchainTransactions = new OpenchainTransactions(web3, myAddress);
        try {
            let ret = await openchainTransactions.mintPawnNft({
                owner: myAddress, 
                assetId: assetId, 
                assetInfo: assetInfo 
            });
            if (ret.error < 0) {
                return ret;
            }
            let newPNftId = ret.data;
            ret = await pawnItemModel.setNftId(assetId, newPNftId);
            if (!ret) {
                return resp.json({ error: -6, data: "Failed to set NFT ID of the minted pawn asset" });
            }
            ret = await pawnItemModel.setStatus(assetId, 4); // 4: Minted
            if (!ret) {
                return resp.json({ error: -7, data: "Failed to set status of the minted pawn asset" });
            }
            return { error: 0, data: ret };
        } catch (error) {
            let errorMessage = error.message.replace("Returned error: ", "");
            return { error: -300, data: errorMessage };
        }
    }

    /**
     * @param {object} newPawnItemObj list of symbols for getting info of
     */
     async swap(params) {
        if (web3 == null) {
            console.log("PawnItemService.swap(): Geth node is not ready yet. Please retry a while later.");
            return { error: -200, data: MSG__GETH_NOT_READY };
        }
        var accountInfo = params ? params.accountInfo ? params.accountInfo : null : null;
        if (accountInfo.addresses == undefined || accountInfo.addresses == {}) {
            return { error: -201, data: "No account for you" };
        }
        var addresses = accountInfo.addresses;
        if (addresses['ETH'] === undefined || addresses['ETH'] === null) {
            return { error: -206, data: "Invalid your address for swapping" };
        }
        var myAddress = addresses['ETH'];
        if (process.env.BLOCKCHAIN_EMULATOR == "ganache") {
            var accounts = await web3.eth.personal.getAccounts();
            myAddress = accounts[0];
        }

        // Get Uri for uploaded item
        var assetId = params ? params.assetId : null;
        if (!assetId) {
            return { error: -207, data: "Invalid asset information to mint pawn NFT" };
        }
        var assetInfo = await pawnItemModel.getById(assetId);

        await web3.eth.accounts.wallet.add({
            privateKey: accountInfo.secret_keys['ETH'], // ownerPrivKey,
            address: myAddress, // ownerAddr,
        });
        const openchainTransactions = new OpenchainTransactions(web3, myAddress);
        try {
            let ret = await openchainTransactions.swapToOcat({owner: myAddress, assetInfo: assetInfo});
            ret = await pawnItemModel.setStatus(4); // 4: Minted
            if (ret.error !== 0) {
                return resp.json({ error: -6, data: "Failed to change status of the pawn asset" });
            }
            return { error: 0, data: ret };
        } catch (error) {
            let errorMessage = error.message.replace("Returned error: ", "");
            return { error: -300, data: errorMessage };
        }
    }
};

module.exports = PawnItemService;