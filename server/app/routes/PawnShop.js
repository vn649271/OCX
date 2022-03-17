const express = require("express");
let pawnshop = express.Router();

const PawnShopController = require("../PawnShop/PawnShopController");
var pawnShopController = new PawnShopController();

pawnshop.post("/create", pawnShopController.create);
pawnshop.post("/upload", pawnShopController.upload);

module.exports = pawnshop;
