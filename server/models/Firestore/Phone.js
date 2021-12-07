const { Firestore } = require('@google-cloud/firestore');

const db = new Firestore();
const cllctn = 'phones';

function Phone() {

    this.getById = function(phoneId) {
        const phoneRef = db.collection(cllctn).doc(phoneId);
        return phoneRef.data();
    }

    this.findOne = async function (jsonWhere) {

        const usersRef = db.collection(cllctn);
        var ret = null;

        for (let field in jsonWhere.where) {
            const snapshot = await usersRef.where(field, '==', jsonWhere.where[field]).get();
            if (snapshot.empty) {
                console.log('No matching documents.');
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

    this.setVerifyCode = async function (phoneId, verifyCody) {
        const phoneRef = db.collection(cllctn).doc(phoneId);
        const res = await phoneRef.update({ verify_code: verifyCody });
        return res;
    }

    this.setStatus = async function (phoneId, status) {
        const phoneRef = db.collection(cllctn).doc(phoneId);
        const res = await phoneRef.update({ status: status });
        return res;
    }
}

module.exports = Phone;
