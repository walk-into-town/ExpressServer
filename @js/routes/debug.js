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
var router = express.Router();
const scan_1 = __importDefault(require("../modules/Debug/scan"));
const UploadFile_1 = __importDefault(require("../modules/FileManager/UploadFile")); //파일 업로드 클래스 import
const result_1 = require("../static/result");
let uploader = new UploadFile_1.default();
let upload = uploader.testupload();
router.post('/file', upload.array('img'), function (req, res) {
    let imgs = [];
    for (let i = 0; i < req.files.length; i++) {
        imgs.push(process.env.domain + req.files[i].filename);
    }
    res.status(200).send(imgs);
});
router.get('/', function (req, res, next) {
    res.render('index', { title: "Express" });
});
router.get('/scan/campaign', function (req, res) {
    let scanner = new scan_1.default(req, res);
    scanner.campaign();
});
router.get('/scan/pinpoint', function (req, res) {
    let scanner = new scan_1.default(req, res);
    scanner.pinpoint();
});
router.get('/scan/coupon', function (req, res) {
    let scanner = new scan_1.default(req, res);
    scanner.coupon();
});
router.get('/scan/Member', function (req, res) {
    let scanner = new scan_1.default(req, res);
    scanner.member();
});
router.get('/scan/Monster', function (req, res) {
    let scanner = new scan_1.default(req, res);
    scanner.monster();
});
router.get('/scan/Ranking', function (req, res) {
    let scanner = new scan_1.default(req, res);
    scanner.ranking();
});
router.get('/scan/Report', function (req, res) {
    let scanner = new scan_1.default(req, res);
    scanner.report();
});
router.get('/scan/prison', function (req, res) {
    let scanner = new scan_1.default(req, res);
    scanner.prison();
});
router.get('/scan/block', function (req, res) {
    let scanner = new scan_1.default(req, res);
    scanner.block();
});
router.get('/session', upload.array('img'), function (req, res) {
    res.status(200).send(req.session);
});
router.post('/fix', function (req, res) {
    let query = req.body;
    let type = query.type;
    let id = query.caid;
    let time = query.time;
    var aws = require('aws-sdk');
    var dotenv = require('dotenv');
    dotenv.config();
    aws.config.update({
        accessKeyId: process.env.aws_access_key_id,
        secretAccessKey: process.env.aws_secret_access_key,
        region: 'us-east-1',
        endpoint: 'http://localhost:8000'
    });
    let doclient = new aws.DynamoDB.DocumentClient();
    let updateParam = {
        TableName: type,
        Key: { id: id },
        UpdateExpression: 'set updateTime = :data',
        ExpressionAttributeValues: { ':data': time }
    };
    const run = () => __awaiter(this, void 0, void 0, function* () {
        try {
            yield doclient.update(updateParam).promise();
            result_1.success.data = '성공';
            res.status(201).send(result_1.success);
        }
        catch (err) {
            result_1.fail.error = result_1.error.dbError;
            result_1.fail.errdesc = err;
            res.status(521).send(result_1.fail);
        }
    });
    run();
});
module.exports = router;
