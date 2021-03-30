"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require('express');
var router = express.Router();
const UploadFile_1 = require("../../modules/@js/FileManager/UploadFile"); //파일 업로드 클래스 import
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
module.exports = router;
