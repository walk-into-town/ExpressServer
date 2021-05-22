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
 * /campaign/evaluate/campaign
 */
const express = __importStar(require("express"));
const authentication_1 = __importDefault(require("../../middlewares/authentication"));
const CampaignManager_1 = __importDefault(require("../../modules/DBManager/CampaignManager"));
const UploadFile_1 = __importDefault(require("../../modules/FileManager/UploadFile"));
var router = express.Router();
const uploader = new UploadFile_1.default();
const upload = uploader.testupload();
router.post('/comment', authentication_1.default, upload.array('img'), function (req, res) {
    let query = req.body;
    let campaignDB = new CampaignManager_1.default(req, res);
    let imgs = [];
    if (req.files != undefined) {
        for (let i = 0; i < req.files.length; i++) {
            imgs.push(process.env.domain + req.files[i].filename);
        }
    }
    query.imgs = imgs;
    campaignDB.insertComment(query);
});
router.get('/comment', function (req, res) {
    let query = req.query;
    let campaignDB = new CampaignManager_1.default(req, res);
    campaignDB.readComment(query);
});
router.delete('/comment', authentication_1.default, function (req, res) {
    let query = req.body;
    let camaignDB = new CampaignManager_1.default(req, res);
    camaignDB.deleteComment(query);
});
router.put('/comment', authentication_1.default, upload.array('img'), function (req, res) {
    let query = req.body;
    let campaignDB = new CampaignManager_1.default(req, res);
    let imgs = [];
    if (req.files != undefined) {
        for (let i = 0; i < req.files.length; i++) {
            imgs.push(process.env.domain + req.files[i].filename);
        }
    }
    query.imgs = imgs;
    campaignDB.updateComment(query);
});
router.put('/rate', authentication_1.default, function (req, res) {
});
module.exports = router;
