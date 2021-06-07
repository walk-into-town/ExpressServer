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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = __importStar(require("express"));
const UploadFile_1 = __importDefault(require("../../modules/FileManager/UploadFile"));
const CampaignManager_1 = __importDefault(require("../../modules/DBManager/CampaignManager"));
const tempCoupon_1 = __importDefault(require("../../modules/DBManager/tempCoupon"));
const tempPinpoint_1 = __importDefault(require("../../modules/DBManager/tempPinpoint"));
const dotenv = __importStar(require("dotenv"));
const authentication_1 = __importDefault(require("../../middlewares/authentication"));
const FeatureManager_1 = require("../../modules/DBManager/FeatureManager");
const result_1 = require("../../static/result");
var router = express.Router();
dotenv.config();
const review = require('./campaignReview');
const uploader = new UploadFile_1.default();
const upload = uploader.testupload();
router.use('/review', review);
//캠페인 등록
router.post('/', authentication_1.default, function (req, res) {
    res.locals.coupons = [];
    let query = req.body;
    query.pcoupons = [];
    console.log(`캠페인 등록\n요청 JSON\n${JSON.stringify(query, null, 2)}`);
    let coupons = req.body.coupons;
    let couponDB = new tempCoupon_1.default(req, res);
    let pinpoints = req.body.pinpoints;
    res.locals.pinpoints = [];
    if (pinpoints == undefined) {
        result_1.fail.error = result_1.error.invalKey;
        result_1.fail.errdesc = '핀포인트 없음';
        res.status(400).send(result_1.fail);
        return;
    }
    // if(coupons == undefined){
    //     let result = {
    //         result: 'failed',
    //         error: 'Missing Requried Value: Coupon'
    //     }
    //     res.status(400).send(result)
    //     return;
    // }
    // if(coupons != undefined){
    //     for (const coupon of coupons) {
    //         console.log(coupon)
    //         console.log(`\n\n`)
    //         couponDB.insert(coupon)
    //     }
    //     for (const coupon of res.locals.coupons){
    //         if(coupon.id == -1){
    //             query.coupons = coupon
    //         }
    //         else{
    //             query.pcoupons.push(coupon)
    //             pinpoints[coupon.paymentCondition].coupon = coupon.id
    //         }
    //     }
    // }
    let pinpointDB = new tempPinpoint_1.default(req, res);
    const run = () => __awaiter(this, void 0, void 0, function* () {
        res.locals.pids = [];
        res.locals.cids = [];
        res.locals.campid = '';
        let campCoupon;
        try {
            console.log(`쿠폰 등록중...`);
            for (let i = 0; i < coupons.length; i++) {
                console.log(`${i}번째 쿠폰 등록`);
                yield couponDB.insert(coupons[i])();
            }
            for (let i = 0; i < res.locals.coupons.length; i++) {
                if (res.locals.coupons[i].paymentCondition == -1) {
                    campCoupon = res.locals.coupons[i].id;
                }
                else {
                    query.pcoupons.push(res.locals.coupons[i].id);
                    pinpoints[res.locals.coupons[i].paymentCondition].coupons = [res.locals.coupons[i].id];
                }
            }
            query.coupons = campCoupon;
            console.log(`핀포인트 등록중...`);
            for (let i = 0; i < pinpoints.length; i++) {
                console.log(`${i}번째 핀포인트 등록`);
                yield pinpointDB.insert(pinpoints[i])();
            }
            query.pinpoints = res.locals.pinpoints;
            console.log('캠페인 등록중...');
            let campaignDB = new CampaignManager_1.default(req, res);
            campaignDB.insert(query);
        }
        catch (err) {
            var aws = require('aws-sdk');
            aws.config.update({
                accessKeyId: process.env.aws_access_key_id,
                secretAccessKey: process.env.aws_secret_access_key,
                region: 'us-east-1',
                endpoint: 'http://localhost:8000'
            });
            let doclient = new aws.DynamoDB.DocumentClient();
            for (const id of res.locals.cids) {
                let deleteParams = {
                    TableName: 'Coupon',
                    Key: {
                        'id': id
                    }
                };
                yield doclient.delete(deleteParams).promise();
            }
            for (const id of res.locals.pids) {
                let deleteParams = {
                    TableName: 'Pinpoint',
                    Key: {
                        'id': id
                    }
                };
                yield doclient.delete(deleteParams).promise();
            }
            let campParam = {
                TableName: 'Campaign',
                Key: {
                    'id': res.locals.campid
                }
            };
            yield doclient.delete(campParam);
            result_1.fail.error = result_1.error.invalReq;
            result_1.fail.errdesc = err;
            res.status(400).send(result_1.fail);
        }
    });
    run();
});
//캠페인 조회
router.get('/', function (req, res) {
    let query = req.query;
    let campaignDB = new CampaignManager_1.default(req, res);
    if (query.value == '') {
        res.redirect('campaign/scan');
        return;
    }
    console.log(`요청 JSON\n${JSON.stringify(query, null, 2)}`);
    let type = FeatureManager_1.toRead.id;
    if (query.type == 'id' && query.condition == 'exact') {
        type = FeatureManager_1.toRead.id;
    }
    else if (query.type == 'pinpoint' && query.condition == 'exact') {
        campaignDB.readByPinpoint(query);
        return;
    }
    else if ((query.type == 'id' || query.type == 'pinpoint') && query.condition != 'exact') {
        result_1.fail.error = result_1.error.invalReq;
        result_1.fail.errdesc = 'id / pinpoint 조회는 exact만 가능합니다.';
        res.status(400).send(result_1.fail);
        return;
    }
    else if (query.type == 'name') {
        type = FeatureManager_1.toRead.name;
    }
    else if (query.type == 'ownner') {
        type = FeatureManager_1.toRead.ownner;
    }
    else if (query.type == 'region') {
        type = FeatureManager_1.toRead.region;
    }
    else {
        result_1.fail.error = result_1.error.invalReq;
        result_1.fail.errdesc = 'type은 name | ownner | region | id 중 하나여야 합니다.';
        res.status(400).send(result_1.fail);
        console.log(`조회 실패. 응답 JSON\n${JSON.stringify(result_1.fail, null, 2)}`);
        return;
    }
    if (query.condition == 'exact') {
        console.log('일치 조회 시작');
        campaignDB.read(query.value, type);
    }
    else if (query.condition == 'part') {
        console.log('부분 일치 조회 시작');
        campaignDB.readPart(query.value, type);
    }
    else {
        result_1.fail.errdesc = result_1.error.invalReq;
        result_1.fail.errdesc = 'condition은 exact | part 중 하나여야 합니다.';
        res.status(400).send(result_1.fail);
        console.log(`조회 실패. 응답 JSON\n${JSON.stringify(result_1.fail, null, 2)}`);
        return;
    }
});
router.get('/scan', function (req, res) {
    let campaignDB = new CampaignManager_1.default(req, res);
    campaignDB.scan();
});
//캠페인 수정
router.put('/', authentication_1.default, upload.array('imgs'), function (req, res) {
    let query = req.body;
    let campaignDB = new CampaignManager_1.default(req, res);
    campaignDB.update(query);
});
//플레이중 유저 조회
router.get('/playing', authentication_1.default, function (req, res) {
    let campaignDB = new CampaignManager_1.default(req, res);
    let query = req.query;
    campaignDB.readPlaying(query);
});
router.get('/recommend', authentication_1.default, function (req, res) {
    let campaignDB = new CampaignManager_1.default(req, res);
    let query = req.query;
    campaignDB.readRecommend(query);
});
module.exports = router;
