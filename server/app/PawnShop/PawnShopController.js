const PawnItemModel = require("./PawnItemModel");
const PawnItemService = require("./PawnItemService");
const UserAuthController = require('../UserAuth/UserAuthController');
const AccountController = require("../Account/AccountController");
const CommonUtils = require("../utils/CommonUtils");

var pawnItemModel = new PawnItemModel();
var pawnItemService = new PawnItemService();
var userController = new UserAuthController();
var accountController = new AccountController();
var commonUtils = new CommonUtils();

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
        resp.set('Content-Range', 'pawnshop 0-9/3');
        resp.set('Access-Control-Expose-Headers', 'Content-Range');
        return resp.json(ret);
    }

    getAssetsFor = async (req, resp) => {
        const userToken = req.body ? req.body.userToken ? req.body.userToken : null : null;
        if (userToken === null) {
            return resp.json({ error: -1, data: "Invalid request" });
        }
        let userId = await userController.getUserIdFor(userToken);
        if (!userId) {
            return resp.json({ error: -2, data: "Invalid user token" });
        }
        let ret = await pawnItemModel.findAllFor(userId);
        if (!ret || ret.length === undefined || ret.length < 0) {
            return resp.json({ error: -3, data: "No result for the assets for this user" });
        }
        return resp.json({error: 0, data: ret});        
    }

    get = async (req, resp) => {
        let id = req.params ? req.params.id ? req.params.id : null : null;
        if (!id) {
            return resp.json({error: -1, data: "Invalid user id to find user info"});
        }
        let ret = await pawnItemModel.getObjectById(id);
        if (!ret) {
            return resp.json({error: -2, data: "Failed to find user info"});
        }
        // ret.created_at = new Date(ret.created_at._seconds * 1000);
        ret.id = id;
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
        let data = req.body ? req.body.data ? req.body.data : null : null;
        if (!data) {
            return resp.json({ error: -1, data: "Invalid request paramter for PawnShop" });
        }
        const userToken = req.body ? req.body.userToken ? req.body.userToken : null : null;
        if (userToken === null) {
            return resp.json({ error: -1, data: "Invalid request" });
        }
        let userInfo = await userController.validateUserToken(userToken);
        if (!userInfo) {
            return resp.json({ error: -2, data: "Invalid user token" });
        }

        try {
            data.verified = false;
            data.owner_id = userInfo.id;
            // Save the pawn item data into firestore
            ret = await pawnItemModel.create(data);
            if (!ret || ret.error === undefined) {
                return resp.json({ error: -2, data: "Failed to save pawn item" });
            }
            if (ret.error != 0) {
                return resp.json({ error: -3, data: ret.data });
            }
            let allAssetsForThisUser = await pawnItemModel.findAllFor(userInfo.id);
            if (!allAssetsForThisUser) {
                return resp.json({ error: -4, data: "Failed to get all pawn assets for you" });
            }
            return resp.json({ error: 0, data: { new_id: ret.data, all_assets: allAssetsForThisUser } });

        } catch (error) {
            return resp.json({ error: -100, data: error.message });
        }
    }

    verified = async(req, resp) => {
        let data = req.body ? req.body.data ? req.body.data : null : null;
        if (!data) {
            return resp.json({ error: -1, data: "Invalid request paramter for PawnShop" });
        }
        const ownerToken = req.body ? req.body.ownerToken ? req.body.ownerToken : null : null;
        if (ownerToken === null) {
            return resp.json({ error: -1, data: "Invalid request" });
        }
        try {
            let ownerInfoObj = await userController.validateUserToken(ownerToken);
            if (!ownerInfoObj) {
                return resp.json({ error: -2, data: "Invalid user token" });
            }
            if (ownerInfoObj.account === undefined || !ownerInfoObj.account) {
                return resp.json({ error: 51, data: "No account" });
            }

            let ret = await accountController.getById(ownerInfoObj.account);
            if (ret === undefined || ret === null || ret.data === undefined || ret.data === null) {
                return resp.json({ error: 52, data: "Not found the account" });
            }
            let accountInfo = ret.data;
            // 
            ret = pawnItemService.create({
                accountInfo: accountInfo,
                assetInfo: {
                    name: data.asset_name,
                    itemUri: ret.id,
                    price: data.price
                }
            });
            return resp.json({ error: 0, data: ret.id });
        } catch (error) {
            return resp.json({ error: -100, data: error.message });
        }
    }
}

module.exports = PawnShopController;
