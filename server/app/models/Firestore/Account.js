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
     * @param {object} jsonAccount parameter object presenting new user information
     */
    this.create = async function (jsonAccount) {
        // Add a new document in collection "users"
        let now = new Date();
        jsonAccount.created_at = now;
        jsonAccount.updated_at = now;

        return await db.collection(cllctn).add(jsonAccount);
    }

    /**
     * Set status in the specified user information docment
     * @param {string} accountId id for the user information document to set status
     * @param {integer} status status to be set
     */
    this.setStatus = async function (accountId, status) {
        const userRef = db.collection(cllctn).doc(accountId);
        const res = await userRef.update({ status: status });
        return res;
    }
}

module.exports = Account;
