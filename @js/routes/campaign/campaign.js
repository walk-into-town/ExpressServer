"use strict";
/**
 * campaign 라우팅 테이블
 * /campaign
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = __importStar(require("express"));
const UploadFile_1 = __importDefault(require("../../modules/FileManager/UploadFile"));
const CampaignManager_1 = __importDefault(require("../../modules/DBManager/CampaignManager"));
const CouponManager_1 = __importDefault(require("../../modules/DBManager/CouponManager"));
const PinpointManager_1 = __importDefault(require("../../modules/DBManager/PinpointManager"));
const dotenv = __importStar(require("dotenv"));
const authentication_1 = __importDefault(require("../../middlewares/authentication"));
var router = express.Router();
dotenv.config();
const pinpoint = require('./pinpoint');
const participate = require('./campaignParticipate');
const evaluate = require('./campaignEvaluate');
const coupon = require('./campaignCoupon');
const uploader = new UploadFile_1.default();
const upload = uploader.testupload();
router.use('/pinpoint', pinpoint);
router.use('/participate', participate);
router.use('/evaluate', evaluate);
router.use('/coupon', coupon);
//캠페인 등록
router.post('/', authentication_1.default, upload.array('img'), function (req, res) {
    res.locals.coupons = [];
    let query = req.body;
    query.pcouons = [];
    let coupons = req.body.coupons;
    let couponDB = new CouponManager_1.default(req, res);
    let pinpoints = req.body.pinpoints;
    for (const coupon of coupons) {
        couponDB.insert(coupon);
    }
    for (const coupon of res.locals.coupons) {
        if (coupon.id == -1) {
            query.coupons = coupon.id;
        }
        else {
            query.pcoupons.push(coupon.id);
            pinpoints[coupon.paymentCondition].coupon = coupon.id;
        }
    }
    res.locals.pinpoints = [];
    let pinpointDB = new PinpointManager_1.default(req, res);
    for (const pinpoint of pinpoints) {
        pinpointDB.insert(pinpoint);
    }
    query.pinpoints = res.locals.pinpoints;
    let imgs = [];
    for (let i = 0; i < req.files.length; i++) {
        imgs.push(process.env.domain + req.files[i].filename);
    }
    query.imgs = imgs;
    let campaignDB = new CampaignManager_1.default(req, res);
    campaignDB.insert(query);
});
//캠페인 조회
router.get('/', function (req, res) {
    let query = req.body;
    let campaignDB = new CampaignManager_1.default(req, res);
    campaignDB.read(query.value, query.type);
});
//캠페인 수정
router.put('/', authentication_1.default, upload.array('img'), function (req, res) {
    let query = JSON.parse(req.body.json);
    let campaignDB = new CampaignManager_1.default(req, res);
    campaignDB.update(query);
});
module.exports = router;
