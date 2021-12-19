import axios from "axios";
import Alert from "../components/common/Alert";
import { BACKEND_BASE_URL } from "../Contants";

export const register = (newUser, onFinishRegister) => {
    return axios
        .post(BACKEND_BASE_URL + "/users/register", newUser)
        .then(response => {
            if (response === undefined || response === null ||
                response.data === undefined || response.data === null ||
                response.data.error === undefined || response.data.error === null) {
                onFinishRegister({ error: -10, message: "Unknown server error" });
                return;
            }
            onFinishRegister(response.data);
        });
};

export const login = (user, onResponse) => {
    return axios
        .post(BACKEND_BASE_URL + "/users/login", {
            email: user.email,
            password: user.password
        })
        .then(response => {
            onResponse(response.data)
        })
        .catch(err => {
            onResponse({ error: -20, message: "Server internal error: " + err });
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
                response.data.error === undefined || response.data.error === null ||
                response.data.error - 0 > 0) {
                onResponse(response.data);
                return;
            }
            onResponse(response.data);
        })
        .catch(err => {
            onResponse({ error: -20, message: "Server internal error: " + err });
        })
}

export const requestPinCodeAgain = (email, onResponse) => {
    return axios
        .post(BACKEND_BASE_URL + "/users/requestPinCodeAgain", {
            email: email
        })
        .then(response => {
            if (response === undefined || response === null ||
                response.data === undefined || response.data === null ||
                response.data.error === undefined || response.data.error === null) {
                onResponse({ error: -10, message: "Unknown server error" });
                return;
            }
            if (onResponse) {
                onResponse(response.data);
            }
        })
        .catch(err => {
            onResponse({ error: -20, message: "Server internal error: " + err });
        })
}

export const requestSmsCode = (phone, onResponse) => {
    return axios
        .get(BACKEND_BASE_URL + "/users/phoneGetCode?phone=" + phone + "&channel=sms")
        .then(response => {
            if (response === undefined || response === null ||
                response.data === undefined || response.data === null ||
                response.data.error === undefined || response.data.error === null) {
                onResponse({ error: -10, message: "Unknown server error" });
                return;
            }
            if (onResponse) {
                onResponse(response.data);
            }
        })
        .catch(err => {
            onResponse({ error: -20, message: "Server internal error" + err });
        })
}

export const verifySmsCode = (phone, code, onResponse) => {
    return axios
        .get(BACKEND_BASE_URL + "/users/phoneVerifyCode?phone=" + phone + "&code=" + code)
        .then(response => {
            if (response === undefined || response === null ||
                response.data === undefined || response.data === null ||
                response.data.error === undefined || response.data.error === null) {
                onResponse({ error: -10, message: "Unknown server error" });
                return;
            }
            if (onResponse) {
                onResponse(response.data);
            }
        })
        .catch(err => {
            onResponse({ error: -20, message: "Server internal error" + err });
        })
}

export const validatePhoneNumber = (phone, onResponse) => {
    return axios
        .post(BACKEND_BASE_URL + "/users/phoneValidate", {
            phone: phone
        })
        .then(response => {
            if (response === undefined || response === null ||
                response.data === undefined || response.data === null ||
                response.data.error === undefined || response.data.error === null) {
                onResponse({ error: -10, message: "Unknown server error" });
                return;
            }
            if (onResponse) {
                onResponse(response.data);
            }
        })
        .catch(err => {
            onResponse({ error: -20, message: "Server internal error" + err });
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
                response.data.error === undefined || response.data.error === null ||
                response.data.error - 0 > 0) {
                Alert("Failed to verify code: ", response.data.message);
                return;
            }
            onResponse(response.data.error);
        })
        .catch(err => {
            onResponse({ error: -20, message: "Server internal error: " + err });
        })
}
