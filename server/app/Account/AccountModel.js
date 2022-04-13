const { Firestore } = require('@google-cloud/firestore');

const db = new Firestore();
const table_name = 'accounts';

/*
Data Model
{
    user_token: <string>,
    passphrase: <string list>,
    password: <string>,
    addresses: {
        eth: <HexString>,
    },
    secret_keys: {
        eth: <HexString>
    }
}
*/

/**
 * Declaration of model object for user information
 */
function AccountModel() {

    this.getById = async function(accountId) {
        const snapshot = await db.collection(table_name).doc(accountId).get();
        if (snapshot.empty) {
            console.info('No matching user information.');
            return null;
        }
        ret = snapshot.data();
        return ret;
    }

    /**
     * Find user information document by the specified conditions
     * @param {json} jsonWhere search condition to be used
     */
    this.findOne = async function (jsonWhere) {

        const usersRef = db.collection(table_name);
        var ret = null;

        for (let field in jsonWhere.where) {
            const snapshot = await usersRef.where(field, '==', jsonWhere.where[field]).get();
            if (snapshot.empty) {
                console.info('No matching user information.');
                return null;
            }
            snapshot.forEach(doc => {
                ret = doc.data();
                ret.id = doc.id;
            });
            break;
        }
        return ret;
    }

    /**
     * Create a new user information document
     * @param {object} jsonAccount parameter object presenting new user information
     */
    this.create = async function (jsonAccount) {
        // Add a new document in collection "users"
        let now = new Date();
        jsonAccount.created_at = now;
        jsonAccount.updated_at = now;
        jsonAccount.assets = [];
        jsonAccount.assets_ganache = [];

        return await db.collection(table_name).add(jsonAccount);
    }

    /**
     * Get address for account
     * @param {object} jsonAccount parameter object presenting new user information
     */
    this.getAddresses = async function (userToken) {
        const usersRef = db.collection(table_name);
        var ret = null;
        const snapshot = await usersRef.where('user_token', '==', userToken).get();
        if (snapshot.empty) {
            console.info('No matching account information.');
            return null;
        }
        snapshot.forEach(doc => {
            ret = doc.data().addresses;
        });
        return ret;
    }

    /**
     * Set status in the specified account information document
     * @param {string} accountId id for the user information document to set status
     * @param {integer} status status to be set
     */
    this.setLock = async function (accountId, lock) {
        const accountRef = db.collection(table_name).doc(accountId);
        const res = await accountRef.update({ locked: lock });
        return res;
    }

    /**
     * Set status in the specified account information document
     * @param {string} accountId id for the user information document to set status
     * @param {integer} status status to be set
     */
    this.setUserToken = async function (accountId, userToken) {
        const accountRef = db.collection(table_name).doc(accountId);
        const res = await accountRef.update({ user_token: userToken });
        return res;
    }

    /**
     * Set status in the specified accoun information docment
     * @param {string} accountId id for the user information document to set status
     * @param {integer} status status to be set
     */
    this.setUserPassword = async function (accountId, userPassword) {
        const accountRef = db.collection(table_name).doc(accountId);
        const res = await accountRef.update({ user_password: userPassword });
        return res;
    }

    /**
     * Set status in the specified accoun information docment
     * @param {string} accountId id for the user information document to set status
     * @param {integer} status status to be set
     */
    this.updateKeyPairs = async function (accountId, symbol, address, secretKey) {
        const accountRef = db.collection(table_name).doc(accountId);
        const accountSnapshot = await accountRef.get();
        if (accountSnapshot.empty) {
            console.info('No matching account information.');
            return null;
        }
        let accountInfo = accountSnapshot.data();
        let addresses = accountInfo.addresses;
        addresses[symbol] = address;
        let secretKeys = accountInfo.secret_keys;
        secretKeys[symbol] = secretKey;
        return await accountRef.update({ addresses: addresses, secret_keys: secretKeys });
    }

    /**
     * Set status in the specified account information document
     * @param {string} accountId id for the user information document to set status
     * @param {integer} status status to be set
     */
    this.addAsset = async function (accountId, assetId) {
        const accountRef = db.collection(table_name).doc(accountId);
        const accountSnapshot = await accountRef.get();
        if (accountSnapshot.empty) {
            console.info('No matching account information.');
            return null;
        }
        let accountInfo = accountSnapshot.data();
        let assets = accountInfo.assets;
        if (process.env.IPC_TYPE === 'ganache') {
            assets = accountInfo.assets_ganache;
        }
        if (!assets) {
            assets = [];
        }
        assets.push(assetId);
        if (process.env.IPC_TYPE === 'ganache') {
            return await accountRef.update({ assets_ganache: assets });
        }        
        return await accountRef.update({ assets: assets });
    }
}

module.exports = AccountModel;
