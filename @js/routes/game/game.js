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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * /game
 */
const express = __importStar(require("express"));
const UploadFile_1 = __importDefault(require("../../modules/FileManager/UploadFile"));
const RankingManager_1 = __importDefault(require("../../modules/DBManager/RankingManager"));
var router = express.Router();
const uploader = new UploadFile_1.default();
const upload = uploader.testupload();
router.put('/clear', function (req, res) {
});
router.get('/ranking', function (req, res) {
    let query = req.query;
    let rankingManaber = new RankingManager_1.default(req, res);
    rankingManaber.read(query);
});
module.exports = router;
