"use strict";
/**
 * campaign 라우팅 테이블
 * pinpoint, register, inquiry, participate, evaluate, coupon
 */
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
const UploadFile_1 = require("../../modules/FileManager/UploadFile");
const CampaignManager_1 = require("../../modules/DBManager/CampaignManager");
var router = express.Router();
const pinpoint = require('./pinpoint');
const participate = require('./campaignParticipate');
const evaluate = require('./campaignEvaluate');
const coupon = require('./campaignCoupon');
const uploader = new UploadFile_1.UploadFile();
const upload = uploader.testupload();
router.use('/pinpoint', pinpoint);
router.use('participate', participate);
router.use('/evaluate', evaluate);
router.use('coupon', coupon);
router.post('/register', upload.array('img'), function (req, res) {
    let query = JSON.parse(req.body.json);
    let imgs = [];
    for (let i = 0; i < req.files.length; i++) {
        imgs.push(req.files[i].filename);
    }
    query.imgs = imgs;
    let campaignDB = new CampaignManager_1.CampaignManager(req, res);
    campaignDB.insert(query);
});
router.post('/inquiry', function (req, res) {
    let query = JSON.parse(req.body.json);
    let campaignDB = new CampaignManager_1.CampaignManager(req, res);
    campaignDB.read(query.value, query.type);
});
router.post('/modify', upload.array('img'), function (req, res) {
});
module.exports = router;
