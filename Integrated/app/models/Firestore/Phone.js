const { Firestore } = require('@google-cloud/firestore');

const db = new Firestore();
const cllctn = 'phones';

/**
 * Declaration of model object for phone information
 */
function Phone() {

    /**
     * Get phone information document by id
     * @param {string} phoneId document id in collection for phone information on Firestore
     * @param {function} onGet callback function to be called on completion of request to Firestore
     * @param {object} params parameter object to callback function
     */
    this.getById = function (phoneId, onGet, params) {
        const phoneRef = db.collection(cllctn).doc(phoneId);
        const doc = phoneRef.get().then(res => {
            if (!res.exists) {
                return null;
            }
            onGet(res.data(), params);
        });
    }

    /**
     * Find phone information document by the specified conditions
     * @param {json} jsonWhere search condition to be used
     */
    this.findOne = async function (jsonWhere) {

        const usersRef = db.collection(cllctn);
        var ret = null;

        for (let field in jsonWhere.where) {
            const snapshot = await usersRef.where(field, '==', jsonWhere.where[field]).get();
            if (snapshot.empty) {
                console.info('No matching phone information.');
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
     * Create a new phone information document
     * @param {object} jsonPhone parameter object presenting new phone information
     */
    this.create = async function (jsonPhone) {
        let now = new Date();
        jsonPhone.created_at = now;
        jsonPhone.updated_at = now;

        const res = await db.collection(cllctn).add(jsonPhone);
        if (res !== null) {
            return res.id;
        }
        return null;
    }

    /**
     * Set verify code in the specified phone information docment
     * @param {string} phoneId id for the phone information document to set verify code
     * @param {string} verifyCode verify code to be set
     */
    this.setVerifyCode = async function (phoneId, verifyCody) {
        const phoneRef = db.collection(cllctn).doc(phoneId);
        const res = await phoneRef.update({ verify_code: verifyCody });
        return res;
    }

    /**
     * Set status in the specified phone information docment
     * @param {string} phoneId id for the phone information document to set status
     * @param {integer} status status to be set
     */
    this.setStatus = async function (phoneId, status) {
        const phoneRef = db.collection(cllctn).doc(phoneId);
        const res = await phoneRef.update({ status: status });
        return res;
    }
}

module.exports = Phone;
