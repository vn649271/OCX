const { Firestore } = require('@google-cloud/firestore');

const db = new Firestore();
const cllctn = 'accounts';

/**
 * Declaration of model object for user information
 */
function Account() {

    /**
     * Find user information document by the specified conditions
     * @param {json} jsonWhere search condition to be used
     */
    this.findOne = async function (jsonWhere) {

        const usersRef = db.collection(cllctn);
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
     * @param {object} jsonUser parameter object presenting new user information
     */
    this.create = async function (jsonUser) {
        // Add a new document in collection "users"
        let now = new Date();
        jsonUser.created_at = now;
        jsonUser.updated_at = now;

        const res = await db.collection(cllctn).add(jsonUser);
        if (res !== null) {
            return res.id;
        }
        return null;
    }

    /**
     * Set pin code in the specified user information docment
     * @param {string} userId id for the user information document to set status
     * @param {string} pinCode pin code to be set
     */
    this.setPinCode = async function (userId, pinCode) {
        const userRef = db.collection(cllctn).doc(userId);
        let now = new Date();
        const res = await userRef.update({ pin_code: pinCode, updated_at: now });
        return res;
    }

    /**
     * Set access token to the server in the specified user information docment
     * @param {string} userId id for the user information document to set status
     * @param {token} token token to be set
     */
    this.setToken = async function (userId, token) {
        const userRef = db.collection(cllctn).doc(userId);
        let now = new Date();
        const res = await userRef.update({ token: token, updated_at: now });
        return res;
    }
    /**
     * Set status in the specified user information docment
     * @param {string} userId id for the user information document to set status
     * @param {integer} status status to be set
     */
    this.setStatus = async function (userId, status) {
        const userRef = db.collection(cllctn).doc(userId);
        const res = await userRef.update({ status: status });
        return res;
    }
}

module.exports = Account;
