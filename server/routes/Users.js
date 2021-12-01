const express = require("express");
let users = express.Router();
const cors = require("cors");

const User = require("../models/Users");
const UserAuthController = require("../controller/UserAuthController");
var userAuthController = new UserAuthController();

users.use(cors());
users.post("/register", userAuthController.register);
users.post("/login", userAuthController.login);

module.exports = users;
