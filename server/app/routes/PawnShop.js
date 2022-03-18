const express = require("express");
let pawnshop = express.Router();

const PawnShopController = require("../PawnShop/PawnShopController");
var pawnShopController = new PawnShopController();

pawnshop.get("/", pawnShopController.getList);
pawnshop.get("/:id", pawnShopController.get);
pawnshop.post("/create", pawnShopController.create);
pawnshop.post("/upload", pawnShopController.upload);

module.exports = pawnshop;
