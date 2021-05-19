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
 * /member
 */
const express = __importStar(require("express"));
const passport_1 = __importDefault(require("passport"));
const MemberManager_1 = __importDefault(require("../../modules/DBManager/MemberManager"));
const authentication_1 = __importDefault(require("../../middlewares/authentication"));
const UploadFile_1 = __importDefault(require("../../modules/FileManager/UploadFile"));
var router = express.Router();
const badge = require('./badge');
const uploader = new UploadFile_1.default();
const upload = uploader.testupload();
router.use('/badge', badge);
//회원가입
router.post('/', function (req, res) {
    let memberDB = new MemberManager_1.default(req, res);
    let query = req.body;
    memberDB.insert(query);
});
//ID 중복 확인
router.get('/checkid', function (req, res) {
    let memberDB = new MemberManager_1.default(req, res);
    let query = req.body;
    memberDB.check('id', query);
});
//닉네임 중복 확인
router.get('/checknickname', function (req, res) {
    let memberDB = new MemberManager_1.default(req, res);
    let query = req.body;
    memberDB.check('nickname', query);
});
router.post('/login', passport_1.default.authenticate('local', {
    successRedirect: '/login/result/success',
    failureRedirect: '/login/result/fail',
    failureFlash: true
}));
router.get('/playing', authentication_1.default, function (req, res) {
    let query = req.query;
    let memberDB = new MemberManager_1.default(req, res);
    memberDB.readPlaying(query);
});
router.get('/my', authentication_1.default, function (req, res) {
    let query = req.query;
    let memberDB = new MemberManager_1.default(req, res);
    memberDB.readMyCamp(query);
});
//로그아웃
router.delete('/logout', authentication_1.default, function (req, res) {
    let memberDB = new MemberManager_1.default(req, res);
    let query = req.body;
    console.log(query);
    memberDB.logout(query);
});
//회원정보 수정
router.put('/', authentication_1.default, upload.array('img'), function (req, res) {
    let memberDB = new MemberManager_1.default(req, res);
    let query = req.body;
    let imgs = [];
    if (req.files != undefined) {
        for (let i = 0; i < req.files.length; i++) {
            imgs.push(process.env.domain + req.files[i].filename);
        }
    }
    if (imgs.length == 0) {
        query.imgs = '';
    }
    else {
        query.imgs = imgs[0];
    }
    memberDB.update(query);
});
//회원정보 조회
router.get('/', authentication_1.default, function (req, res) {
    let memberDB = new MemberManager_1.default(req, res);
    memberDB.read('');
});
//회원탈퇴
router.delete('/', authentication_1.default, function (req, res) {
});
router.get('/coupon', authentication_1.default, function (req, res) {
});
router.put('/coupon', authentication_1.default, function (req, res) {
});
module.exports = router;
