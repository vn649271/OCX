const {
    ASSET_PENDING,
    ASSET_SUBMITTED,
    ASSET_DECLINED,
    ASSET_RESUBMITTED,
    ASSET_APPROVED,
    ASSET_MINTED,
    ASSET_LOANED,
    ASSET_BURNED,
    ASSET_STATUS_LABELS    
} = require("./Constants");var util = require('util');
require('dotenv').config();
const PawnItemModel = require("./PawnItemModel");
const { openchainRouterInstance, DEFAULT_DEADLINE } = require('../Services/OpenchainRouter');
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

    async create(assetData, accountInfo) {
        try {
            if (accountInfo.addresses == undefined || accountInfo.addresses == {}) {
                return { error: -201, data: "No account for you" };
            }
            // Load pawn ratio from valuation report
            // Calculate and add the fee information and quoted amount of OCAT
            let ret = await this.getFeeList(accountInfo);
            if (ret.error < 0) {
                return {error: -1, data: "Failed to get initial fee"};
            }
            let submitFee = ret.data.submit;
            assetData.quoted_price = (assetData.reported_price * assetData.price_percentage) / 100 - 
                                    (submitFee.application + submitFee.valuation);
            ret = await pawnItemModel.create(assetData);
        } catch (error) {
            let errorMessage = error.message.replace("Returned error: ", "");
            return { error: -300, data: errorMessage };
        }
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
        const ocRouter = await openchainRouterInstance(web3, accountInfo);
        try {
            let ret = await ocRouter.mintPNFT({
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
            ret = await pawnItemModel.setStatus(assetId, ASSET_MINTED);
            if (!ret) {
                return resp.json({ error: -7, data: "Failed to set status of the minted pawn asset" });
            }
            return { error: 0, data: ret };
        } catch (error) {
            let errorMessage = error.message.replace("Returned error: ", "");
            return { error: -300, data: errorMessage };
        }
    }

    async burn(params) {
        return {error: 0, data: ""};
    }

    /**
     * @param {object} newPawnItemObj list of symbols for getting info of
     */
     async exchangeToOcat(params) {
        if (web3 == null) {
            console.log("PawnItemService.exchangeToOcat(): Geth node is not ready yet. Please retry a while later.");
            return { error: -200, data: MSG__GETH_NOT_READY };
        }
        var accountInfo = params ? params.accountInfo ? params.accountInfo : null : null;
        if (accountInfo.addresses == undefined || accountInfo.addresses == {}) {
            return { error: -201, data: "No account for you" };
        }
        var addresses = accountInfo.addresses;
        if (addresses['ETH'] === undefined || addresses['ETH'] === null) {
            return { error: -202, data: "Invalid your address for loaning" };
        }
        var myAddress = addresses['ETH'];

        // Get Uri for uploaded item
        var assetId = params ? params.assetId : null;
        if (!assetId) {
            return { error: -203, data: "Invalid asset information to mint pawn NFT" };
        }
        var assetInfo = await pawnItemModel.getById(assetId);

        let ret = await web3.eth.accounts.wallet.add({
            privateKey: accountInfo.secret_keys['ETH'], // ownerPrivKey,
            address: myAddress, // ownerAddr,
        });
        if (ret.error) {
            return { error: -204, data: "Failed to add account" };
        }
        try {
            const ocRouter = await openchainRouterInstance(web3, accountInfo);
            ret = await ocRouter.exchangeToOcat({owner: myAddress, assetInfo: assetInfo});
            if (ret.error) {
                return { error: -205, data: ret.data };
            }
            let result = ret.data;
            ret = await pawnItemModel.setStatus(assetId, ASSET_LOANED);
            if (!ret) {
                return { error: -206, data: "Failed to change status of the pawn asset" };
            }
            return { error: 0, data: result };
        } catch (error) {
            let errorMessage = error.message.replace("Returned error: ", "");
            return { error: -300, data: errorMessage };
        }
    }

    /**
     * @param {object} newPawnItemObj list of symbols for getting info of
     */
     async exchangeFromOcat(params) {
        if (web3 == null) {
            console.log("PawnItemService.exchangeToOcat(): Geth node is not ready yet. Please retry a while later.");
            return { error: -200, data: MSG__GETH_NOT_READY };
        }
        var accountInfo = params ? params.accountInfo ? params.accountInfo : null : null;
        if (accountInfo.addresses == undefined || accountInfo.addresses == {}) {
            return { error: -201, data: "No account for you" };
        }
        var addresses = accountInfo.addresses;
        if (addresses['ETH'] === undefined || addresses['ETH'] === null) {
            return { error: -202, data: "Invalid your address for loaning" };
        }
        var myAddress = addresses['ETH'];

        // Get Uri for uploaded item
        var assetId = params ? params.assetId : null;
        if (!assetId) {
            return { error: -203, data: "Invalid asset information to mint pawn NFT" };
        }
        var assetInfo = await pawnItemModel.getById(assetId);

        let ret = await web3.eth.accounts.wallet.add({
            privateKey: accountInfo.secret_keys['ETH'], // ownerPrivKey,
            address: myAddress, // ownerAddr,
        });
        if (ret.error) {
            return { error: -204, data: "Failed to add account" };
        }
        try {
            const ocRouter = await openchainRouterInstance(web3, accountInfo);
            ret = await ocRouter.exchangeFromOcat({owner: myAddress, assetInfo: assetInfo});
            if (ret.error) {
                return { error: -205, data: ret.data };
            }
            let result = ret.data;
            ret = await pawnItemModel.setStatus(assetId, ASSET_MINTED);
            if (!ret) {
                return { error: -206, data: "Failed to change status of the pawn asset" };
            }
            return { error: 0, data: result };
        } catch (error) {
            let errorMessage = error.message.replace("Returned error: ", "");
            return { error: -300, data: errorMessage };
        }
    }
    getFeeList = async(accountInfo) => {
        if (web3 == null) {
            return {
                error: -200,
                data: "Geth node is not ready yet. Please retry a while later."
            };
        }
        if (accountInfo.addresses == undefined || accountInfo.addresses == {}) {
            return {
                error: -201,
                data: "No account for you"
            };
        }
        let ret = null;
        const ocRouter = await openchainRouterInstance(web3, accountInfo);
        if (!ocRouter) {
            return {
                error: -202,
                data: "Invalid account for you"
            };
        }
        try {
            return await ocRouter.getFeeList();
        } catch (error) {
            return resp.json({ error: -300, data: error });
        }
    }
};

module.exports = PawnItemService;