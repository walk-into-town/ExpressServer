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
Object.defineProperty(exports, "__esModule", { value: true });
const express = __importStar(require("express"));
var router = express.Router();
const UploadFile_1 = require("../modules/FileManager/UploadFile"); //파일 업로드 클래스 import
const DistributionController_1 = require("../modules/DistributionManager/DistributionController");
// let uploader = new UploadFile()
let uploader = new UploadFile_1.UploadFile();
let upload = uploader.uploadFile('test'); //static 함수로 선언된 uploadFile을 통해 업로드를 위한 multer 객체 획득
router.get('/', function (req, res, next) {
    res.render('index', { title: "Express" });
});
router.post('/upload', upload.array('imgs'), function (req, res) {
    res.status(200).send('success');
});
router.post('/test', upload.single('imgs'), function (req, res) {
    console.log(req.body.test);
    res.status(200).send('success');
});
router.post('/cloudtest', function (req, res) {
    let test = new DistributionController_1.DistributionController(res);
    test.getDistributionConfig();
});
router.get('/dbtest', function (req, res) {
    res.status(200).send('success');
});
router.get('/dateTest', function (req, res) {
    function test() {
        return __awaiter(this, void 0, void 0, function* () {
            let date1 = new Date();
            yield new Promise((r) => setTimeout(r, 7000));
            let date2 = new Date();
            console.log(date1);
            console.log(date2);
            let date3 = new Date(Date.parse('2021-04-03T10:53:39.025Z'));
            console.log(date3);
        });
    }
    test();
});
module.exports = router;
