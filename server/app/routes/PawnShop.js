const express = require("express");
let pawnshop = express.Router();

const PawnShopController = require("../PawnShop/PawnShopController");
var pawnShopController = new PawnShopController();

pawnshop.get("/", pawnShopController.getList);
pawnshop.get("/:id", pawnShopController.get);
pawnshop.put("/:id", pawnShopController.update);
pawnshop.post("/create", pawnShopController.create);
pawnshop.post("/mint", pawnShopController.mint);
pawnshop.post("/burn", pawnShopController.burn);
pawnshop.post("/loan", pawnShopController.loan);
pawnshop.post("/restore", pawnShopController.restore);
pawnshop.post("/upload", pawnShopController.upload);
pawnshop.post("/assets", pawnShopController.getAssetsFor);
pawnshop.post("/fees", pawnShopController.getFees);

module.exports = pawnshop;