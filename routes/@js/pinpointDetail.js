"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = __importStar(require("express"));
const PinpointManager_1 = require("../../modules/@js/DBManager/PinpointManager");
var router = express.Router();
router.post('/inquiry', function (req, res) {
    let query = JSON.parse(req.body.json);
    let pinpointDB = new PinpointManager_1.PinpointManager(req, res);
    pinpointDB.readDetail(query);
});
router.post('/delete', function (req, res) {
});
router.post('/modify', function (req, res) {
    let query = JSON.parse(req.body.json);
    let pinpointDB = new PinpointManager_1.PinpointManager(req, res);
    pinpointDB.deleteDetail(query);
});
module.exports = router;
