import axios from "axios";

// var BACKEND_BASE_URL = "https://openchaindexbackend.dt.r.appspot.com";
var BACKEND_BASE_URL = "http://localhost:5000";

export const register = (newUser, onSuccessCallback) => {
    return axios
        .post(BACKEND_BASE_URL + "/users/register", {
            first_name: newUser.first_name,
            last_name: newUser.last_name,
            email: newUser.email,
            password: newUser.password,
            country: newUser.country
        })
        .then(response => {
            if (response !== undefined && response !== null &&
                response.data !== undefined && response.data !== null &&
                response.data.error !== undefined && response.data.error !== null &&
                response.data.error > 0) {
                alert("Failed to register: " + response.data.message);
                return;
            }
            onSuccessCallback(response.data);
        });
};

export const login = user => {
    return axios
        .post(BACKEND_BASE_URL + "/users/login", {
            email: user.email,
            password: user.password
        })
        .then(response => {
            localStorage.setItem("usertoken", response.data)
            return response.data
        })
        .catch(err => {
            alert(err)
        })
}

export const verifyPinCode = (pinCode, onResponse) => {
    return axios
        .post(BACKEND_BASE_URL + "/users/verifyPinCode", {
            pinCode: pinCode
        })
        .then(response => {
            if (response === undefined || response === null ||
                response.data === undefined || response.data === null ||
                response.data.verify === undefined || response.data.verify === null ||
                response.data.verify - 0 === 0) {
                alert("Failed to verify recaptcha");
                return;
            }
            onResponse(response.data.verify);
        })
        .catch(err => {
            alert(err)
        })
}

export const verifyRecaptcha = (token, onResponse) => {
    return axios
        .post(BACKEND_BASE_URL + "/recaptcha", {
            "g-recaptcha-response": token
        })
        .then(response => {
            if (response === undefined || response === null ||
                response.data === undefined || response.data === null ||
                response.data.verify === undefined || response.data.verify === null ||
                response.data.verify - 0 === 0) {
                alert("Failed to verify recaptcha");
                return;
            }
            onResponse(response.data.verify);
        })
        .catch(err => {
            alert(err)
        })
}