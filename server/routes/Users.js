const express = require("express");
let users = express.Router();
const cors = require("cors");

const UserAuthController = require("../controller/UserAuthController");
var userAuthController = new UserAuthController();

users.use(cors());
users.post("/register", userAuthController.register);
users.post("/login", userAuthController.login);
users.post("/verifyPinCode", userAuthController.verifyPinCode);

module.exports = users;
