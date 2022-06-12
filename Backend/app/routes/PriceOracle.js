const express = require("express");
let priceOracle = express.Router();

const PriceOracleController = require("../PriceOracle/PriceOracleController");
var priceOracleController = new PriceOracleController();

priceOracle.get("/tokens", priceOracleController.getTokenPrices);

module.exports = priceOracle;