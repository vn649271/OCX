const PriceOracleService = require('./PriceOracleService');
const UserAuthController = require('../UserAuth/UserAuthController');
const AccountController = require("../Account/AccountController");
const CommonUtils = require("../utils/CommonUtils");

var priceOracleService = new PriceOracleService();
var userController = new UserAuthController();
var commonUtils = new CommonUtils();
var accountController = new AccountController();

var self = null;

/**
 * Controller for user authentication
 */
class PriceOracleController {

    constructor() {
        self = this;
    }

    getTokenPrices = async(req, resp, next) => {
        var userToken = req.body ? req.body.userToken ? req.body.userToken : null : null;
        if (userToken === null) {
            return resp.json({ error: -1, data: "Invalid request" });
        }
        try {
            let userInfo = userController.validateUserToken(userToken);
            if (!userInfo) {
                return resp.json({ error: -50, data: "Invalid user token or internet disconnected" });
            }
            let accountInfo = await accountController.getById(userInfo.account);
            if (!accountInfo) {
                return resp.json({ error: -51, data: "Not found valid account" });
            }
            priceOracleService.getTokenPrices(resp, accountInfo);
        } catch (error) {
            let errorMessage = error.message.replace("Returned error: ", "");
            return resp.json({ error: -100, data: errorMessage });
        }
    }
}

module.exports = PriceOracleController;
