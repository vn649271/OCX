import axios from "axios";
import { BACKEND_BASE_URL } from "../Contants";

/**
 * Create a new account in user's wallet.
 * @param {string} userToken    user token
 * @param {string} account      account address
 * 
 * @returns new account address
 */
export const createAccount = (params) => {
    return axios
        .post(BACKEND_BASE_URL + "/wallet/create", {
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

/**
 * Connect to specified wallet.
 * @param {string} userToken    user token
 * @param {string} account      account address
 * 
 * @returns 
 */
 export const getBalance = (params) => {
    return axios
        .post(BACKEND_BASE_URL + "/wallet/balance", {
            userToken: params.userToken,
            accountId: params.account
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

/**
 * Connect to specified wallet.
 * @param {string} userToken    user token
 * @param {string} walletId     wallet address
 * 
 * @returns 
 */
 export const connect = (params) => {
    return axios
        .post(BACKEND_BASE_URL + "/wallet/connect", {
            userToken: params.userToken,
            wallet: params.walletId
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
        .post(BACKEND_BASE_URL + "/wallet/send", {
            userToken: params.userToken,
            from: params.from,
            to: params.to,
            amount: params.amount
        })
        .then(response => {
            if (response !== undefined && response !== null
            && response.error !== undefined && response.error !== null) {
                params.onComplete(response);
            }
        })
        .catch(error => {
            console.log("Failed to createAccount(): error: ", error)
            params.onFailed(error);
        })
}
