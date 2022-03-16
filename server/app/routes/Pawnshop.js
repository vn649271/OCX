const express = require("express");
let pawnshop = express.Router();

const PawnshopController = require("../Pawnshop/PawnshopController");
var pawnshopController = new PawnshopController();

pawnshop.post("/upload", pawnshopController.uploadPawnItem);

module.exports = pawnshop;
