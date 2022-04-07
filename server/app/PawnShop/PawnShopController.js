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
} = require("./Constants");
const PawnItemModel = require("./PawnItemModel");
const PawnItemService = require("./PawnItemService");
const UserAuthController = require('../UserAuth/UserAuthController');
const AccountController = require("../Account/AccountController");
const CommonUtils = require("../utils/CommonUtils");

var pawnItemModel = new PawnItemModel();
var pawnItemService = new PawnItemService();
var userController = new UserAuthController();
var commonUtils = new CommonUtils();
var accountController = new AccountController();

var self = null;


/**
 * Controller for user authentication
 */
class PawnShopController {
    constructor() {
        self = this;
    }

    /*
     * 
     * @param {*} req 
     * @param {*} resp 
     * @returns 
     */
    upload = async(req, resp) => {
        const newpath = process.env.HOME + "/Public" + process.env.PAWNSHOP_ASSET_UPLOAD_PATH;
        const file = req.files ? req.files.file ? req.files.file : null : null;
        if (!file) {
            return resp.json({ error: -1, data: "Invalid request paramter for PawnShop" });
        }
        let filename = file.name;
        filename = filename.replaceAll(' ', '_');

        let ethInterfaces = await commonUtils.getIpList();
        if (!ethInterfaces) {
            return resp.json({ error: -2, data: "Failed to get IP address for the host" });
        }
        let mainInterface = null;
        for (let i in ethInterfaces) {
            mainInterface = ethInterfaces[i];
            break;
        }
        if (mainInterface === undefined || mainInterface[0] === undefined || !mainInterface[0]) {
            return resp.json({ error: -2, data: "Invalid Ethernet interface for the host" });
        }
        let hostIp = "https://" + mainInterface[0];
        if (process.env.RUN_MODE == 0) { // in local machine
            hostIp = "http://localhost";
        }
        let uploadedUrl = hostIp + process.env.PAWNSHOP_ASSET_UPLOAD_PATH + filename;
        var savePath = `${newpath}${filename}`;

        file.mv(savePath, (err, data) => {
            if (err) {
                return resp.json({ error: -2, data: "File upload failed" });
            }
            return resp.json({ error: 0, data: uploadedUrl });
        });
    }

    getList = async (req, resp) => {
        let ret = await pawnItemModel.all();
        if (!ret) {
            return resp.json({});
        }
        ret.map(item => {
            item.statusText = ASSET_STATUS_LABELS[item.status - 0];
        });
        resp.set('Content-Range', 'pawnshop 0-9/3');
        resp.set('Access-Control-Expose-Headers', 'Content-Range');
        return resp.json(ret);
    }

    _getAssetFor = async assetId => {
        let allAssetIDs = await accountController.allAsset(assetId);
        if (!allAssetIDs || allAssetIDs.length === undefined || allAssetIDs.length < 1) {
            return null;
        }
        var allAssetsForUser = [];
        for (let i in allAssetIDs) {
            let assetInfo = await pawnItemModel.getById(allAssetIDs[i]);
            assetInfo.id = allAssetIDs[i];
            allAssetsForUser.push(assetInfo);
        }
        return allAssetsForUser;
    }

    getAssetsFor = async (req, resp) => {
        const userToken = req.body ? req.body.userToken ? req.body.userToken : null : null;
        if (userToken === null) {
            return resp.json({ error: -1, data: "Invalid request" });
        }
        let userInfo = userController.validateUserToken(userToken);
        if (!userInfo) {
            return resp.json({ error: -2, data: "Invalid user token or internet disconnected" });
        }
        if (userInfo.account === undefined || !userInfo.account) {
            return resp.json({ error: -3, data: "No account for you" });
        }
        let hisAllAssets = await this._getAssetFor(userInfo.account);
        if (!hisAllAssets || hisAllAssets.length === undefined || hisAllAssets.length < 1) {
            return resp.json({ error: 1, data: "No result for the assets for this user" });
        }
        return resp.json({error: 0, data: hisAllAssets});        
    }

    get = async (req, resp) => {
        let id = req.params ? req.params.id ? req.params.id : null : null;
        if (!id) {
            return resp.json({error: -1, data: "Invalid user id to find user info"});
        }
        let ret = await pawnItemModel.getById(id);
        if (!ret) {
            return resp.json({error: -2, data: "Failed to find user info"});
        }
        // ret.created_at = new Date(ret.created_at._seconds * 1000);
        ret.id = id;
        ret.statusText = ASSET_STATUS_LABELS[ret.status - 0];
        return resp.json(ret);
    }

    update = async (req, resp) => {
        let dataToUpdate = req.body ? req.body: null;
        if (!dataToUpdate) {
            return resp.json({error: -1, data: "Invalid data for pawn item to be updated"});
        }
        let ret = await pawnItemModel.save({id: dataToUpdate.id, data: dataToUpdate});
        if (!ret) {
            return resp.json({error: -2, data: "Failed to update the item"});
        }
        return resp.json({ id: dataToUpdate.id });
    }

    /**
     * 
     * @param {*} req 
     *  data: {
        asset_name: '',
        asset_type: '',
        asset_description: '',
        asset_address: '',
        asset_address_street: '',
        asset_address_city: '',
        asset_address_state: '',
        asset_address_zipcode: '',
        asset_address_country: '',
        valuation_report: '',
        price: 0,
        price_percentage: 0,
        quote_price: 0,
        estimated_ocat: 0,
        estimated_fee: '',
     }
     * @param {*} resp 
     * @returns 
     */
    create = async(req, resp) => {
        let assetData = req.body ? req.body.data ? req.body.data : null : null;
        if (!assetData) {
            return resp.json({ error: -1, data: "Invalid request paramter for PawnShop" });
        }
        const userToken = req.body ? req.body.userToken ? req.body.userToken : null : null;
        if (userToken === null) {
            return resp.json({ error: -1, data: "Invalid request" });
        }
        let userInfo = userController.validateUserToken(userToken);
        if (!userInfo) {
            return resp.json({ error: -2, data: "Invalid user token or internet disconnected" });
        }
        if (userInfo.account === undefined || !userInfo.account) {
            return resp.json({ error: -3, data: "No account for you" });
        }

        try {
            assetData.status = ASSET_SUBMITTED; // Submitted
            // Save the pawn item data into firestore
            let ret = await pawnItemModel.create(assetData);
            if (!ret || ret.error === undefined) {
                return resp.json({ error: -2, data: "Failed to save pawn item" });
            }
            if (ret.error != 0) {
                return resp.json({ error: -3, data: ret.data });
            }
            let newAssetId = ret.data;
            ret = await accountController.addAsset(userInfo.account, newAssetId);
            if (!ret) {
                return resp.json({ error: -3, data: "Failed to register the asset" });
            }
            let hisAllAssets = await this._getAssetFor(userInfo.account);
            if (!hisAllAssets || hisAllAssets.length === undefined || hisAllAssets.length < 1) {
                return resp.json({ error: -4, data: "Failed to get all pawn assets for you" });
            }
            return resp.json({ error: 0, data: { new_id: newAssetId, all_assets: hisAllAssets } });
        } catch (error) {
            return resp.json({ error: -100, data: error.message });
        }
    }

    mint = async(req, resp) => {
        const ownerToken = req.body ? req.body.ownerToken ? req.body.ownerToken : null : null;
        if (ownerToken === null) {
            return resp.json({ error: -1, data: "Invalid request" });
        }
        let assetId = req.body ? req.body.assetId ? req.body.assetId : null : null;
        if (!assetId) {
            return resp.json({ error: -2, data: "Invalid request paramter for issuing NFT token" });
        }
        let assetStatus = await pawnItemModel.getStatus(assetId);
        if (assetStatus !== ASSET_APPROVED) {
            return resp.json({ error: -3, data: "Invalid status" });
        }
        try {
            let ownerInfoObj = userController.validateUserToken(ownerToken);
            if (!ownerInfoObj) {
                return resp.json({ error: -4, data: "Invalid user token or internet disconnected" });
            }
            if (ownerInfoObj.account === undefined || !ownerInfoObj.account) {
                return resp.json({ error: 51, data: "No account" });
            }

            let accountInfo = await accountController.getById(ownerInfoObj.account);
            if (!accountInfo) {
                return resp.json({ error: 52, data: "Not found the account" });
            }
            // 
            let ret = await pawnItemService.mint({
                accountInfo: accountInfo,
                assetId: assetId
            });
            if (ret.error !== 0) {
                return resp.json({ error: -5, data: ret.data });
            }
            // let minted = ret.data;
            let hisAllAssets = await this._getAssetFor(ownerInfoObj.account);
            if (!hisAllAssets || hisAllAssets.length === undefined || hisAllAssets.length < 1) {
                return resp.json({ error: -4, data: "Failed to get all pawn assets for you" });
            }
            return resp.json({ error: 0, data: { all_assets: hisAllAssets } });
            // return resp.json({ error: 0, data: minted });
        } catch (error) {
            return resp.json({ error: -100, data: error.message });
        }
    }

    burn = async(req, resp) => {
        const ownerToken = req.body ? req.body.ownerToken ? req.body.ownerToken : null : null;
        if (ownerToken === null) {
            return resp.json({ error: -1, data: "Invalid request" });
        }
        let assetId = req.body ? req.body.assetId ? req.body.assetId : null : null;
        if (!assetId) {
            return resp.json({ error: -2, data: "Invalid request paramter for burning asset" });
        }
        let assetStatus = await pawnItemModel.getStatus(assetId);
        if (assetStatus !== ASSET_SUBMITTED) {
            return resp.json({ error: -3, data: "Invalid status" });
        }
        try {
            let ownerInfoObj = userController.validateUserToken(ownerToken);
            if (!ownerInfoObj) {
                return resp.json({ error: -4, data: "Invalid user token or internet disconnected" });
            }
            if (ownerInfoObj.account === undefined || !ownerInfoObj.account) {
                return resp.json({ error: 51, data: "No account" });
            }

            let accountInfo = await accountController.getById(ownerInfoObj.account);
            if (!accountInfo) {
                return resp.json({ error: 52, data: "Not found the account" });
            }
            // 
            let ret = await pawnItemService.burn({
                accountInfo: accountInfo,
                assetId: assetId
            });
            if (ret.error !== 0) {
                return resp.json({ error: -5, data: ret.data });
            }
            let hisAllAssets = await this._getAssetFor(ownerInfoObj.account);
            if (!hisAllAssets || hisAllAssets.length === undefined || hisAllAssets.length < 1) {
                return resp.json({ error: -6, data: "Failed to get all pawn assets for you" });
            }
            return resp.json({ error: 0, data: { all_assets: hisAllAssets } });
            // return resp.json({ error: 0, data: minted });
        } catch (error) {
            return resp.json({ error: -100, data: error.message });
        }
    }

    loan = async(req, resp) => {
        const ownerToken = req.body ? req.body.ownerToken ? req.body.ownerToken : null : null;
        if (ownerToken === null) {
            return resp.json({ error: -1, data: "Invalid request" });
        }
        let assetId = req.body ? req.body.assetId ? req.body.assetId : null : null;
        if (!assetId) {
            return resp.json({ error: -2, data: "Invalid request paramter for issuing NFT token" });
        }
        let assetStatus = await pawnItemModel.getStatus(assetId);
        if (assetStatus !== ASSET_MINTED) {
            return resp.json({ error: -3, data: "Invalid status" });
        }
        try {
            let ownerInfoObj = userController.validateUserToken(ownerToken);
            if (!ownerInfoObj) {
                return resp.json({ error: -4, data: "Invalid user token or internet disconnected" });
            }
            if (ownerInfoObj.account === undefined || !ownerInfoObj.account) {
                return resp.json({ error: 51, data: "No account" });
            }

            let accountInfo = await accountController.getById(ownerInfoObj.account);
            if (!accountInfo) {
                return resp.json({ error: 52, data: "Not found the account" });
            }
            // 
            let ret = await pawnItemService.exchangeToOcat({
                accountInfo: accountInfo,
                assetId: assetId
            });
            if (ret.error !== 0) {
                return resp.json({ error: -5, data: ret.data });
            }
            let hisAllAssets = await this._getAssetFor(ownerInfoObj.account);
            if (!hisAllAssets || hisAllAssets.length === undefined || hisAllAssets.length < 1) {
                return resp.json({ error: -4, data: "Failed to get all pawn assets for you" });
            }
            return resp.json({ error: 0, data: { all_assets: hisAllAssets } });
        } catch (error) {
            return resp.json({ error: -100, data: error.message });
        }
    }

    restore = async(req, resp) => {
        const ownerToken = req.body ? req.body.ownerToken ? req.body.ownerToken : null : null;
        if (ownerToken === null) {
            return resp.json({ error: -1, data: "Invalid request" });
        }
        let assetId = req.body ? req.body.assetId ? req.body.assetId : null : null;
        if (!assetId) {
            return resp.json({ error: -2, data: "Invalid request paramter for issuing NFT token" });
        }
        let assetStatus = await pawnItemModel.getStatus(assetId);
        if (assetStatus !== ASSET_LOANED) {
            return resp.json({ error: -3, data: "Invalid status" });
        }
        try {
            let ownerInfoObj = userController.validateUserToken(ownerToken);
            if (!ownerInfoObj) {
                return resp.json({ error: -4, data: "Invalid user token or internet disconnected" });
            }
            if (ownerInfoObj.account === undefined || !ownerInfoObj.account) {
                return resp.json({ error: 51, data: "No account" });
            }

            let accountInfo = await accountController.getById(ownerInfoObj.account);
            if (!accountInfo) {
                return resp.json({ error: 52, data: "Not found the account" });
            }
            // 
            let ret = await pawnItemService.exchangeFromOcat({
                accountInfo: accountInfo,
                assetId: assetId
            });
            if (ret.error !== 0) {
                return resp.json({ error: -5, data: ret.data });
            }
            let hisAllAssets = await this._getAssetFor(ownerInfoObj.account);
            if (!hisAllAssets || hisAllAssets.length === undefined || hisAllAssets.length < 1) {
                return resp.json({ error: -4, data: "Failed to get all pawn assets for you" });
            }
            return resp.json({ error: 0, data: { all_assets: hisAllAssets } });
        } catch (error) {
            return resp.json({ error: -100, data: error.message });
        }
    }
}

module.exports = PawnShopController;
