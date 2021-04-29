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
const express = __importStar(require("express"));
const UploadFile_1 = __importDefault(require("../../modules/FileManager/UploadFile")); //파일 업로드 클래스 import
const PinpointManager_1 = __importDefault(require("../../modules/DBManager/PinpointManager"));
const detail = require('./pinpointDetail');
const quiz = require('./PinpointQuiz');
var router = express.Router();
let uploader = new UploadFile_1.default();
let upload = uploader.testupload();
router.post('/register', upload.array('img'), function (req, res) {
    let query = JSON.parse(req.body.json);
    let imgs = [];
    if (req.files != undefined) {
        for (let i = 0; i < req.files.length; i++) {
            imgs.push("https://walk-into-town.ga/" + req.files[i].filename);
        }
    }
    query.imgs = imgs;
    let pinpointDB = new PinpointManager_1.default(req, res);
    pinpointDB.insert(query);
});
router.post('/list', function (req, res) {
    let query = req.body;
    let read = [];
    query.id.forEach(id => {
        let obj = { 'id': id };
        read.push(obj);
    });
    let pinpointDB = new PinpointManager_1.default(req, res);
    pinpointDB.read(read);
});
router.post('/inquiry', function (req, res) {
    let query = req.body;
    let pinpointDB = new PinpointManager_1.default(req, res);
    pinpointDB.read([query]);
});
router.post('/delete', function (req, res) {
    let query = req.body;
    let pinpointDB = new PinpointManager_1.default(req, res);
    pinpointDB.delete(query);
});
router.post('/modify', upload.array('img'), function (req, res) {
    let query = JSON.parse(req.body.json);
    let imgs = [];
    for (let i = 0; i < req.files.length; i++) {
        imgs.push("https://walk-into-town.ga/" + req.files[i].filename);
    }
    query.imgs = imgs;
    let pinpointDB = new PinpointManager_1.default(req, res);
    pinpointDB.update(query);
});
router.use('/detail', detail);
router.use('/quiz', quiz);
module.exports = router;
