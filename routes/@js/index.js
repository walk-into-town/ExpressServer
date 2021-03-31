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
var router = express.Router();
const UploadFile_1 = require("../../modules/@js/FileManager/UploadFile"); //파일 업로드 클래스 import
const DistributionController_1 = require("../../modules/@js/DistributionManager/DistributionController");
// let uploader = new UploadFile()
let upload = UploadFile_1.UploadFile.uploadFile(); //static 함수로 선언된 uploadFile을 통해 업로드를 위한 multer 객체 획득
let test = UploadFile_1.UploadFile.test();
router.get('/', function (req, res, next) {
    res.render('index', { title: "Express" });
});
router.post('/upload', upload.single('imgs'), function (req, res) {
    res.status(200).send('success');
});
router.post('/test', test.single('imgs'), function (req, res) {
    res.status(200).send('success');
});
router.post('/cloudtest', function (req, res) {
    let test = new DistributionController_1.DistributionController(res);
    test.getDistributionConfig();
});
module.exports = router;
