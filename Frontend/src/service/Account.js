import axios from "axios";
import { BACKEND_BASE_URL } from "../Contants";

const GET_REQ = 0;
const POST_REQ = 1;

export default function AccountService() {

    // AccountService = () => {}

    this._sendRequest = async (params, reqType = POST_REQ) => {
        var response = null;
        try {
            if (reqType === POST_REQ) {
                response = await axios.post(params.url, params.data); // Default reqType = POST_REQ
            } else if (reqType === GET_REQ) {
                response = await axios.get(params.url, params.data);
            }
            let ret = response ? response.data ? response.data : null : null;
            if (ret === null) {
                ret = { error: -1000 }
            }
            return ret;
        } catch (error) {
            console.log("Failed to getBalance(): error: ", error)
            return { error: -2000, data: error }
        }
    }

    /**
     * Create a new account.
     * @param {string} userToken    user token
     * @param {string} account      account address
     * 
     * @returns new account address
     */
    this.createAccount = async (params) => {
        let _params = {};
        _params['data'] = params;
        _params['url'] = BACKEND_BASE_URL + "/account/create";
        return await this._sendRequest(_params);
    }

    /**
     * Recovery exist account.
     * @param {string} userToken    user token
     * @param {string} account      account address
     * 
     * @returns new account address
     */
    this.restoreAccount = async (params) => {
        let _params = {};
        _params['data'] = params;
        _params['url'] = BACKEND_BASE_URL + "/account/restore";
        return await this._sendRequest(_params);
    }

    /**
     * Lock an account.
     * @param {string} userToken    user token
     * 
     * @returns locked status
     */
    this.lockAccount = async (params) => {
        let _params = {};
        _params['data'] = params;
        _params['url'] = BACKEND_BASE_URL + "/account/lock";
        return await this._sendRequest(_params);
    }

    /**
     * Unlock an account.
     * @param {string} userToken    user token
     * 
     * @returns unlocked status
     */
    this.unlockAccount = async (params) => {
        let _params = {};
        _params['data'] = params;
        _params['url'] = BACKEND_BASE_URL + "/account/unlock";
        return await this._sendRequest(_params);
    }

    this.connectAccount = async (params) => {
        let _params = {};
        _params['data'] = params;
        _params['url'] = BACKEND_BASE_URL + "/account/connect";
        return await this._sendRequest(_params);
    }

    /**
     * Connect to specified account.
     * @param {string} userToken    user token
     * @param {string} account      account address
     * 
     * @returns 
     */
    this.getBalances = async (params) => {
        let _params = {};
        _params['data'] = params;
        _params['url'] = BACKEND_BASE_URL + "/account/balances";
        return await this._sendRequest(_params);
    }

    /**
     * Connect to specified account.
     * @param {string} userToken    user token
     * @param {string} account      account address
     * 
     * @returns 
     */
    this.getPrices = async (params) => {
        let _params = {};
        _params['data'] = params;
        _params['url'] = BACKEND_BASE_URL + "/account/prices";
        return await this._sendRequest(_params);
    }

    /**
     * Send specified symbol of cryptocurrency from an account to another one.
     * @param {string} userToken    user token
     * @param {string} symbol       Cryptocurrency to send
     * @param {string} from         Account address to send from
     * @param {string} to           Account address to send to
     * @param {string} amount       Amount to send
     * @param {string} onComplete   Callback function when complete request
     * @param {string} onFailed     Callback function when failed request
     * 
     * @returns 
     */
    this.sendCryptoCurrency = async (params) => {
        let _params = {};
        _params['data'] = params;
        _params['url'] = BACKEND_BASE_URL + "/account/send";
        return await this._sendRequest(_params);
    }

    /**
     * Connect to specified account.
     * @param {string} userToken    user token
     * @param {string} account      account address
     * 
     * @returns 
     */
     this.getBestPrice = async (params) => {
        let _params = {};
        _params['data'] = params;
        _params['url'] = BACKEND_BASE_URL + "/account/getBestPrice";
        return await this._sendRequest(_params);
    }

    /**
     * Connect to specified account.
     * @param {string} userToken    user token
     * @param {string} account      account address
     * 
     * @returns 
     */
    this.swap = async (params) => {
        let _params = {};
        _params['data'] = params;
        _params['url'] = BACKEND_BASE_URL + "/account/swap";
        return await this._sendRequest(_params);
    }

    /**
     * Connect to specified account.
     * @param {string} userToken    user token
     * @param {string} account      account address
     * 
     * @returns 
     */
    this.getTokenList = async (params) => {
        let _params = {};
        _params['data'] = params;
        _params['url'] = BACKEND_BASE_URL + "/account/tokenList";
        return await this._sendRequest(_params);
    }
}
