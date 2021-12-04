const { Firestore } = require('@google-cloud/firestore');

const db = new Firestore();
const cllctn = 'users';

function User() {

    this.findOne = async function(jsonWhere) {

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

    this.create = async function(jsonUser) {
        // Add a new document in collection "users"
        const res = await db.collection(cllctn).add(jsonUser);
        if (res !== null) {
            return res.id;
	}
	return null;
    }

    this.setPinCode = async function(userId, pinCode) {
	const userRef = db.collection(cllctn).doc(userId);
        const res = await userRef.update({pin_code: pinCode});
	return res;
    }
	
    this.setToken = async function(userId, token) {
	const userRef = db.collection(cllctn).doc(userId);
        const res = await userRef.update({token: token});
	return res;
    }

}

module.exports = User;
