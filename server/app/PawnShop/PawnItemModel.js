const { Firestore } = require('@google-cloud/firestore');

const db = new Firestore();
const collection = 'pawnitems';

/**
 * 
 *  model: {
        assetName: '',
        assetType: '',
        assetDescription: '',
        assetAddress: '',
        city: '',
        street: '',
        zipcode: '',
        country: '',
        valuationReport: '',
        price: 0,
        price_percentage: 0,
        quote_price: 0,
        estimated_ocat: 0,
        estimated_fee: '',
    }
 */


/**
 * Declaration of model object for pawn Item
 */
function PawnItemModel() {

    this.getObject = async function(pawnItemId) {
        const snapshot = await db.collection(collection).doc(pawnItemId).get();
        if (snapshot.empty) {
            console.info('No matching user information.');
            return null;
        }
        ret = snapshot.data();
        return ret;
    }

    this.all = async function() {
        let retArray = [];
        const usersRef = db.collection(collection);
        const snapshot = await usersRef.get();
        if (snapshot.empty) {
            console.info('No matching user information.');
            return null;
        }
        let ret = null;
        snapshot.forEach(doc => {
            ret = doc.data();
            ret.id = doc.id;
            retArray.push(ret);
        });
        return retArray;
    }

    /**
     * Find user information document by the specified conditions
     * @param {json} jsonWhere search condition to be used
     */
    this.findOne = async function (jsonWhere) {

        const usersRef = db.collection(collection);
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
     * @param {object} jsonPawnItem parameter object presenting new user information
     */
    this.create = async function (jsonPawnItem) {
        // Add a new document in collection "users"
        let now = new Date();
        jsonPawnItem.created_at = now;
        jsonPawnItem.updated_at = now;

        return await db.collection(collection).add(jsonPawnItem);
    }

    /**
     * Get address for pawnItem
     * @param {object} jsonPawnItem parameter object presenting new user information
     */
    this.getAddresses = async function (userToken) {
        const usersRef = db.collection(collection);
        var ret = null;
        const snapshot = await usersRef.where('user_token', '==', userToken).get();
        if (snapshot.empty) {
            console.info('No matching pawnItem information.');
            return null;
        }
        snapshot.forEach(doc => {
            ret = doc.data().addresses;
        });
        return ret;
    }

    // /**
    //  * Set status in the specified pawnItem information document
    //  * @param {string} pawnItemId id for the pawn item document to set status
    //  * @param {integer} status status to be set
    //  */
    // this.setLock = async function (pawnItemId, lock) {
    //     const pawnItemRef = db.collection(collection).doc(pawnItemId);
    //     const res = await pawnItemRef.update({ locked: lock });
    //     return res;
    // }
}

module.exports = PawnItemModel;
