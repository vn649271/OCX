const express = require("express");
let pawnshop = express.Router();

const PawnShopController = require("../PawnShop/PawnShopController");
var pawnShopController = new PawnShopController();

pawnshop.get("/", pawnShopController.getList);
pawnshop.get("/:id", pawnShopController.get);
pawnshop.put("/:id", pawnShopController.update);
pawnshop.post("/create", pawnShopController.create);
pawnshop.post("/upload", pawnShopController.upload);
pawnshop.post("/assets", pawnShopController.getAssetsFor);

module.exports = pawnshop;