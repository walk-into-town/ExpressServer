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
const UploadFile_1 = require("../../modules/@js/FileManager/UploadFile"); //파일 업로드 클래스 import
const detail = require('./pinpointDetail');
const quiz = require('./PinpointQuiz');
var router = express.Router();
let uploader = new UploadFile_1.UploadFile();
let upload = uploader.uploadFile('witpinpointimgss');
router.post('/register', upload.array('img'), function (req, res) {
    let test = JSON.parse(req.body.json);
    console.log(req.files[0].filename);
    console.log(req.files[1].filename);
});
router.post('/list', function (req, res) {
});
router.post('/inquiry', function (req, res) {
});
router.post('/delete', function (req, res) {
});
router.post('/modify', function (req, res) {
});
router.use('/detail', detail);
router.use('/quiz', quiz);
module.exports = router;
