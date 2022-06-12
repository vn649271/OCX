require('dotenv').config();
const { openchainRouterInstance, DEFAULT_DEADLINE } = require('../Services/OpenchainRouter');
var { getWeb3Provider } = require('../Services/geth/init');

var self = null;
var web3 = null;
setTimeout(() => {
    web3 = getWeb3Provider();
}, 20000);

/**
 * Controller for user authentication
 */
class PriceOracleService {

    constructor() {
        self = this;
        this.gethError = null
    }

    getTokenPrices = async(resp, accountInfo) => {
        if (web3 == null) {
            return resp.json({ 
                error: -200,
                data: "Geth node is not ready yet. Please retry a while later."
            });
        }
        if (accountInfo.addresses == undefined || accountInfo.addresses == {}) {
            return resp.json({
                error: -201, 
                data: "No account for you" 
            });
        }
        let ret = null;
        const ocRouter = await openchainRouterInstance(web3, accountInfo);
        if (!ocRouter) {
            return resp.json({
                error: -202,
                data: "Invalid account for you"
            });
        }
        try {
            ret = await ocRouter.getTokenPrices();
            return resp.json(ret);
        } catch (error) {
            return resp.json({ error: -300, data: error });
        }
    }
};

module.exports = PriceOracleService;