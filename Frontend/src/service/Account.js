import axios from "axios";
import { BACKEND_BASE_URL } from "../Contants";

/**
 * Create a new account.
 * @param {string} userToken    user token
 * @param {string} account      account address
 * 
 * @returns new account address
 */
export const createAccount = (params) => {
    return axios
        .post(BACKEND_BASE_URL + "/account/create", {
            userToken: params.userToken,
            password: params.password
        })
        .then(response => {
            if (response !== undefined && response !== null
            && response.error !== undefined && response.error !== null) {
                if (params.onComplete) {
                    params.onComplete(response);
                }
            }
        })
        .catch(error => {
            console.log("Failed to createAccount(): error: ", error)
            if (params.onFailed) {
                params.onFailed(error);
            }
        })
}

export const getAccountInfo = (params) => {
    return axios
        .get(BACKEND_BASE_URL + "/account/" + params.userToken)
        .then(response => {
            let ret = response ? response.data ? response.data: null: null;
            if (ret === null) {
                ret = { error: -100 }
            }
            if (params.onComplete) {
                params.onComplete(ret);
            }        
        })
        .catch(error => {
            console.log("Failed to createAccount(): error: ", error)
            if (params.onFailed) {
                params.onFailed(error);
            }
        })
}

/**
 * Connect to specified account.
 * @param {string} userToken    user token
 * @param {string} account      account address
 * 
 * @returns 
 */
export const getBalance = (params) => {
    return axios
        .get(BACKEND_BASE_URL + "/account/balance/" + params.userToken)
        .then(response => {
            let ret = response ? response.data ? response.data: null: null;
            if (ret === null) {
                ret = { error: -100 }
            }
            if (params.onComplete) {
                params.onComplete(ret);
            }        
        })
        .catch(error => {
            console.log("Failed to createAccount(): error: ", error)
            if (params.onFailed) {
                params.onFailed(error);
            }
        })
}

/**
 * Connect to specified account.
 * @param {string} userToken    user token
 * @param {string} accountId     account address
 * 
 * @returns 
 */
export const connect = (params) => {
    return axios
        .post(BACKEND_BASE_URL + "/account/connect", {
            userToken: params.userToken,
            account: params.accountId
        })
        .then(response => {
            let error = response ? response.data ? response.data.error ? 
                                response.data.error: null : null: null;
            if (error === 0) {
                if (params.onComplete) {
                    params.onComplete(response.data);
                }
            }
        })
        .catch(error => {
            console.log("Failed to createAccount(): error: ", error)
            if (params.onFailed) {
                params.onFailed(error);
            }
        })
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
    return axios
        .post(BACKEND_BASE_URL + "/account/send", {
            userToken: params.userToken,
            toAddress: params.toAddress,
            amount: params.amount
        })
        .then(response => {
            console.log("sendCryptoCurrency(): response: ", response);
			let data = response.data ? response.data.data ? response.data.data : null: null;
            params.onComplete(response.data);
        })
        .catch(error => {
            console.log("Failed to createAccount(): error: ", error)
            params.onFailed(error);
        })
}
