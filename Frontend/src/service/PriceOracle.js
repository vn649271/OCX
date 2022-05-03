import axios from "axios";
import { BACKEND_BASE_URL } from "../Contants";

const GET_REQ = 0;
const POST_REQ = 1;

export default function PriceOracleService() {

    this._sendRequest = async (params, reqType = POST_REQ) => {
        var response = null;
        try {
            if (reqType === POST_REQ) {
                response = await axios.post(params.url, params.data); // Default reqType = POST_REQ
            } else if (reqType === GET_REQ) {
                response = await axios.get(params.url, { params: params.data });
            }
            let ret = response ? response.data ? response.data : null : null;
            if (ret === null) {
                ret = { error: -1000, data: "Failed for network status" }
            }
            return ret;
        } catch (error) {
            console.log("Failed to getBalance(): error: ", error)
            return { error: -2000, data: error }
        }
    }

    /**
     * Get prices of all tokens from our DEX.
     * @param {string} userToken    user token
     * @param {string} account      account address
     * 
     * @returns 
     */
    this.getPrices = async (params) => {
        let _params = {};
        _params['data'] = params;
        _params['url'] = BACKEND_BASE_URL + "/price/tokens";
        return await this._sendRequest(_params, GET_REQ);
    }
}
