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
 * /campaign/pinpoint
 */
const express = __importStar(require("express"));
const UploadFile_1 = __importDefault(require("../../modules/FileManager/UploadFile")); //파일 업로드 클래스 import
const PinpointManager_1 = __importDefault(require("../../modules/DBManager/PinpointManager"));
const dotenv = __importStar(require("dotenv"));
const authentication_1 = __importDefault(require("../../middlewares/authentication"));
const result_1 = require("../../static/result");
const nbsp_1 = require("../../modules/Logics/nbsp");
const detail = require('./pinpointDetail');
const quiz = require('./PinpointQuiz');
var router = express.Router();
dotenv.config();
let uploader = new UploadFile_1.default();
let upload = uploader.testupload();
router.post('/', authentication_1.default, upload.array('img'), function (req, res) {
    let query = JSON.parse(req.body.json);
    let imgs = [];
    if (req.files != undefined) {
        for (let i = 0; i < req.files.length; i++) {
            imgs.push(process.env.domain + req.files[i].filename);
        }
    }
    query.imgs = imgs;
    let pinpointDB = new PinpointManager_1.default(req, res);
    pinpointDB.insert(query);
});
router.get('/', function (req, res) {
    let query = req.query;
    console.log(`요청 JSON\n${JSON.stringify(query)}`);
    let pinpointDB = new PinpointManager_1.default(req, res);
    if (query.type == 'single') {
        let read = [];
        if (typeof (query.value) == 'string') {
            query.value = nbsp_1.nbsp2plus(query.value);
            read.push({ 'id': query.value });
        }
        else {
            query.value.forEach(id => {
                id = nbsp_1.nbsp2plus(id);
                let obj = { 'id': id };
                read.push(obj);
            });
        }
        pinpointDB.read(read);
        return;
    }
    if (query.type == 'list') {
        query.value = nbsp_1.nbsp2plus(query.value);
        pinpointDB.readList(query);
        return;
    }
    result_1.fail.error = result_1.error.invalReq;
    result_1.fail.errdesc = 'type은 list | single중 하나여야 합니다.';
    res.status(400).send(result_1.fail);
});
// router.post('/inquiry', function(req: express.Request, res: express.Response){
//     let query = req.body
//     let pinpointDB = new PinpointManager(req, res)
//     pinpointDB.read([query])
// })
router.delete('/', authentication_1.default, function (req, res) {
    let query = req.body;
    let pinpointDB = new PinpointManager_1.default(req, res);
    pinpointDB.delete(query);
});
router.put('/', authentication_1.default, upload.array('img'), function (req, res) {
    let query = JSON.parse(req.body.json);
    let imgs = [];
    for (let i = 0; i < req.files.length; i++) {
        imgs.push(process.env.domain + req.files[i].filename);
    }
    query.imgs = imgs;
    let pinpointDB = new PinpointManager_1.default(req, res);
    pinpointDB.update(query);
});
router.use('/detail', detail);
router.use('/quiz', quiz);
module.exports = router;
