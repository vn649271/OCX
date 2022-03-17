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
    async create(params) {
        if (web3 == null) {
            console.log("PawnItemService.create(): Geth node is not ready yet. Please retry a while later.");
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
        var assetInfo = params ? params.assetInfo : null;
        if (!assetInfo) {
            return { error: -207, data: "Invalid asset information to mint pawn NFT" };
        }
        // await web3.eth.accounts.wallet.add({
        //     privateKey: "5001699b4eb1ac8a3094e18e7c956fa83ed7d4b50293d3c7b9e6f2aef888d7d4", // ownerPrivKey,
        //     address: myAddress, // ownerAddr,
        // });
        const openchainTransactions = new OpenchainTransactions(web3, myAddress);
        try {
            let ret = await openchainTransactions.mintPawnNft({owner: myAddress, assetInfo: assetInfo});
            return { error: 0, data: ret };
        } catch (error) {
            let errorMessage = error.message.replace("Returned error: ", "");
            return { error: -300, data: errorMessage };
        }
    }
};

module.exports = PawnItemService;