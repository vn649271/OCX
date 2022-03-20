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

    this.getObjectById = async function(pawnItemId) {
        const snapshot = await db.collection(collection).doc(pawnItemId).get();
        if (snapshot.empty) {
            console.info('No matching asset information.');
            return null;
        }
        ret = snapshot.data();
        return ret;
    }

    this.all = async function() {
        let retArray = [];
        const pawnAssetsRef = db.collection(collection);
        const snapshot = await pawnAssetsRef.get();
        if (snapshot.empty) {
            console.info('No matching pawn asset information.');
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
     * Find pawn asset information document by the specified conditions
     * @param {json} jsonWhere search condition to be used
     */
    this.findOne = async function (jsonWhere) {

        const pawnAssetsRef = db.collection(collection);
        var ret = null;

        for (let field in jsonWhere.where) {
            const snapshot = await pawnAssetsRef.where(field, '==', jsonWhere.where[field]).get();
            if (snapshot.empty) {
                console.info('No matching pawn asset information.');
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
     * Create a new pawn asset information document
     * @param {object} jsonPawnItem parameter object presenting new pawn asset information
     */
     this.create = async function (jsonPawnItem) {
        // Add a new document in collection "pawn assets"
        let now = new Date();
        now = now.toISOString();
        jsonPawnItem.created_at = now;
        jsonPawnItem.updated_at = now;

        let ret = await db.collection(collection).add(jsonPawnItem);
        if (!ret || ret.id === undefined || !ret.id) {
            return {error: -1, data: "Failed to register new pawn item"};
        }
        // Get all submitted assets for the user
        return {error: 0, data: ret.id };
    }

    this.save = async function (params) {
        let id = params.id;
        let data = params.data;

        let now = new Date();
        data.updated_at = now.toISOString();

        const pawnItemRef = db.collection(collection).doc(id);
        const ret = await pawnItemRef.update(data);

        return ret;
    }

    /**
     * Set status in the specified pawnItem information document
     * @param {string} pawnItemId id for the pawn item document to set status
     * @param {integer} status status to be set
     */
    this.setStatus = async function (pawnItemId, status) {
        const pawnitemsRef = db.collection(collection).doc(pawnItemId);
        const res = await pawnitemsRef.update({ status: status });
        return res;
    }

    this.getStatus = async function(assetId) {
        let assetInfo = await this.getObjectById(assetId);
        if (!assetInfo) {
            return -1;
        }
        return assetInfo.status;
    }
}

module.exports = PawnItemModel;
