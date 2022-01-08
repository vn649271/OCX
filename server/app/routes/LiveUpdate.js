const express = require("express");
let LiveUpdate = express.Router();

const LiveUpdateController = require("../LiveUpdate/LiveUpdateController");
var liveUpdateController = new LiveUpdateController();

LiveUpdate.post("/updalodUpdate", liveUpdateController.uploadUpdate);
LiveUpdate.post("/", liveUpdateController.doUpdate);

module.exports = LiveUpdate;
