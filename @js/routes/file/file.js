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
 * /game
 */
const express = __importStar(require("express"));
const UploadFile_1 = __importDefault(require("../../modules/FileManager/UploadFile"));
const result_1 = require("../../static/result");
var router = express.Router();
const uploader = new UploadFile_1.default();
const upload = uploader.testupload();
router.post('/', upload.array('imgs'), function (req, res) {
    let imgs = [];
    if (req.files != undefined) {
        for (let i = 0; i < req.files.length; i++) {
            imgs.push(process.env.domain + req.files[i].filename);
        }
    }
    else {
        result_1.fail.error = result_1.error.invalFile;
        result_1.fail.errdesc = '파일 전송 에러. 파일이 누락되었거나 전송 도중 손상되었습니다.';
        res.status(400).send(result_1.fail);
        return;
    }
    result_1.success.data = imgs;
    res.status(201).send(result_1.success);
});
module.exports = router;
