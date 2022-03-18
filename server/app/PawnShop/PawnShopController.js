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
        const newpath = process.env.HOME + process.env.PAWNSHOP_ASSET_UPLOAD_PATH;
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

    getList = async (req, resp) => {
        let ret = await pawnItemModel.all();
    // resp.set('X-Total-Count', '3');
        resp.set('Content-Range', 'pawnshop 0-9/3');
        resp.set('Access-Control-Expose-Headers', 'Content-Range');
        return resp.json(ret);
        return resp.json([
            { 
                "id": 0, 
                "date": "03/18/2022", 
                "reference": "1ewf23123123123", 
                "customer_id": "123", 
                "status": 'delivered',
                "total": "123123",
                "returned": false
            },
            { 
                "id": 1, 
                "date": "03/18/2022", 
                "reference": "1ewf34", 
                // "customer_id": "234", 
                "status": 'delivered',
                "total": "11111", 
                "returned": true
            },
            { 
                "id": 2, 
                "date": "03/18/2022", 
                "reference": "1ewf45", 
                "customer_id": "345", 
                "status": 'cancelled',
                "total": "222222", 
                "returned": true
            },
        ]);
    }

    get = async (req, resp) => {
        return resp.json(
            { 
                "id": 0, 
                "date": "03/18/2022", 
                "reference": "1ewf23123123123", 
                "customer_id": "123", 
                "status": 'delivered',
                "total": "123123",
                "returned": false
            });
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
            data.owner_token = userToken;
            // Save the pawn item data into firestore
            /**
             * 
                {
                    asset_name: "aaa",
                    asset_type: "",
                    asset_description: "aaaaaaa",
                    asset_address_street: "aaaaaaaaaa",
                    asset_address_city: "aaaaaaaa",
                    asset_address_state: "New South Wales",
                    asset_address_zipcode: "345345345",
                    asset_address_country: "Australia",
                    valuation_report: "/home/vn/Public/openchaindex/pawnshop/files/PolarBear.org.jpg",
                    price: "1000",
                    price_percentage: "70",
                    quote_price: "700",
                    estimated_ocat: "700",
                    estimated_fee: "",
                    verified: false,
                    owner_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6IkZmVUZpZzgzSUt3WDlzWGd6bkVsIiwiaWF0IjoxNjQ2OTk2MjMwLCJleHAiOjE2NDY5OTc2NzB9.KE8zOOfoebrZx-DmLUBT93quRtiUnEwoMidDM-s5TKw",
                    created_at: {
                    },
                    updated_at: {
                    },
                }
             */
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
