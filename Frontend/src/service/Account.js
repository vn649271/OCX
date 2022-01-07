import axios from "axios";
import { BACKEND_BASE_URL } from "../Contants";

const GET_REQ = 0;
const POST_REQ = 1;

function _sendRequest(params, reqType) {
    var reqCall = axios.post(params.url, params.reqParam); // Default reqType = POST_REQ
    if (reqType !== undefined && reqType == GET_REQ) {
        reqCall = axios.get(params.url, params.reqParam);
    }
    reqCall.then(response => {
        let ret = response ? response.data ? response.data: null: null;
        if (ret === null) {
            ret = { error: -100 }
        }
        if (params.onComplete) {
            params.onComplete(ret);
        }        
    })
    .catch(error => {
        console.log("Failed to getBalance(): error: ", error)
        if (params.onFailed) {
            params.onFailed(error);
        }
    })
}

/**
 * Create a new account.
 * @param {string} userToken    user token
 * @param {string} account      account address
 * 
 * @returns new account address
 */
export const createAccount = (params) => {
    params.url = BACKEND_BASE_URL + "/account/create";
    _sendRequest(params);
}

/**
 * Lock an account.
 * @param {string} userToken    user token
 * 
 * @returns locked status
 */
export const lockAccount = (params) => {
    params.url = BACKEND_BASE_URL + "/account/lock";
    _sendRequest(params);
}

/**
 * Unlock an account.
 * @param {string} userToken    user token
 * 
 * @returns unlocked status
 */
export const unlockAccount = (params) => {
    params.url = BACKEND_BASE_URL + "/account/unlock";
    _sendRequest(params);
}

export const connectAccount = (params) => {
    params.url = BACKEND_BASE_URL + "/account/connect";
    _sendRequest(params);
}

/**
 * Connect to specified account.
 * @param {string} userToken    user token
 * @param {string} account      account address
 * 
 * @returns 
 */
export const getBalance = (params) => {
    params.url = BACKEND_BASE_URL + "/account/balance";
    _sendRequest(params);
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
export const sendCryptoCurrency = (params) => {
    params.url = BACKEND_BASE_URL + "/account/send";
    _sendRequest(params);
}
