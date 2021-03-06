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
var router = express.Router();
const UploadFile_1 = __importDefault(require("../modules/FileManager/UploadFile")); //파일 업로드 클래스 import
const authentication_1 = __importDefault(require("../middlewares/authentication"));
const result_1 = require("../static/result");
// let uploader = new UploadFile()
let uploader = new UploadFile_1.default();
let upload = uploader.uploadFile('test'); //static 함수로 선언된 uploadFile을 통해 업로드를 위한 multer 객체 획득
router.get('/', function (req, res, next) {
    res.render('index', { title: "Express" });
});
router.get('/auth', authentication_1.default, function (req, res) {
    res.send('123');
});
router.get('/suc', function (req, res) {
    result_1.success.data = 'success';
    res.send(result_1.success);
});
router.get('/fail', function (req, res) {
    result_1.fail.error = 'error',
        result_1.fail.errdesc = 'errdesc';
    res.send(result_1.fail);
});
module.exports = router;
