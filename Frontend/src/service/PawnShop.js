import axios from "axios";
import { BACKEND_BASE_URL } from "../Contants";

const GET_REQ = 0;
const POST_REQ = 1;

export default function PawnShopService() {

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
                ret = { error: -1000, data: "Failed for network status" }
            }
            return ret;
        } catch (error) {
            console.log("Failed to getBalance(): error: ", error)
            return { error: -2000, data: error }
        }
    }

    /**
     * Submit to create a new pawn item.
     * @param {string} userToken    user token
     * @param {string} account      account address
     * 
     * @returns new account address
     */
    this.create = async (params) => {
        let _params = {};
        _params['data'] = params;
        _params['url'] = BACKEND_BASE_URL + "/pawnshop/create";
        return await this._sendRequest(_params);
    }

    this.upload = async (params) => {
        try {
            const formData = new FormData();
            formData.append("file", params.file);
            formData.append("fileName", params.fileName);
    
            const response = await axios.post(
                BACKEND_BASE_URL + "/pawnshop/upload",
                formData
            );
            let ret = response ? response.data ? response.data : null : null;
            if (ret === null) {
                ret = { error: -1000, data: "Failed for network status" }
            }
            return ret;
        } catch (ex) {
            console.log("Uploading valuation report: ", ex)
        }
    }
}
