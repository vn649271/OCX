const PawnItemModel = require("./PawnItemModel");
const PawnItemService = require("./PawnItemService");
const UserAuthController = require('../UserAuth/UserAuthController');
const AccountController = require("../Account/AccountController");

var pawnItemModel = new PawnItemModel();
var pawnItemService = new PawnItemService();
var userController = new UserAuthController();
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
        const newpath = __dirname + process.env.PAWNSHOP_ASSET_UPLOAD_PATH;
        const file = req.files ? req.files.file ? req.files.file : null : null;
        if (!file) {
            return resp.json({ error: -1, data: "Invalid request paramter for PawnShop" });
        }
        const filename = file.name;
        var savePath = `${newpath}${filename}`;
        file.mv(savePath, (err, data) => {
            if (err) {
                return resp.json({ error: -2, data: "File upload failed" });
            }
            return resp.json({ error: 0, data: savePath });
        });
    }

    /**
     * 
     * @param {*} req 
     *  data: {
            assetName: '',
            assetType: '',
            assetDescription: '',
            assetAddress: '',
            city: '',
            street: '',
            zipcode: '',
            country: '',
            valuationReport: '',
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
        try {
            let userInfoObj = await userController.validateUserToken(userToken);
            if (!userInfoObj) {
                return resp.json({ error: -2, data: "Invalid user token" });
            }
            if (userInfoObj.account === undefined || !userInfoObj.account) {
                return resp.json({ error: 51, data: "No account" });
            }

            let ret = await accountController.getModelInJson(userInfoObj.account);
            if (ret === undefined || ret === null || ret.data === undefined || ret.data === null) {
                return resp.json({ error: 52, data: "Not found the account" });
            }
            let accountInfo = ret.data;
            data.verified = false;
            data.ownerToken = userToken;
            // Save the pawn item data into firestore
            ret = await pawnItemModel.create(data);
            if (!ret) {
                return resp.json({ error: -2, data: "Failed to save pawn item" });
            }
            // // 
            // pawnItemService.create({
            //     accountInfo: accountInfo, 
            //     assetInfo: {
            //         name: data.asset_name,
            //         itemUri: ret.id,
            //         price: data.price
            //     }
            // });
            return resp.json({ error: 0, data: ret.id });

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

            let ret = await accountController.getModelInJson(ownerInfoObj.account);
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