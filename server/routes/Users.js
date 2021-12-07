const express = require("express");
let users = express.Router();
const cors = require("cors");

const UserAuthController = require("../controller/UserAuthController");
var userAuthController = new UserAuthController();
const PhoneVerifyController = require('../controller/PhoneVerifyController');
var phoneVerifyController = new PhoneVerifyController();

users.use(cors());
users.post("/register", userAuthController.register);
users.post("/login", userAuthController.login);
users.post("/verifyPinCode", userAuthController.verifyPinCode);
users.post("/requestPinCodeAgain", userAuthController.requestPinCodeAgain);

users.get('/phoneGetCode', phoneVerifyController.getCode);
users.get('/phoneVerifyCode', phoneVerifyController.verifyCode);

module.exports = users;
