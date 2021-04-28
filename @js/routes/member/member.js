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
const passport_1 = __importDefault(require("passport"));
const MemberManager_1 = __importDefault(require("../../modules/DBManager/MemberManager"));
var router = express.Router();
const badge = require('./badge');
router.use('/badge', badge);
//회원가입
router.post('/register', function (req, res) {
    let memberDB = new MemberManager_1.default(req, res);
    let query = req.body;
    memberDB.insert(query);
});
//ID 중복 확인
router.post('/checkid', function (req, res) {
    let memberDB = new MemberManager_1.default(req, res);
    let query = req.body;
    memberDB.check('id', query);
});
//닉네임 중복 확인
router.post('/checknickname', function (req, res) {
    let memberDB = new MemberManager_1.default(req, res);
    let query = req.body;
    memberDB.check('nickname', query);
});
//로그인
// router.post('/login', function(req: express.Request, res: express.Response){
//     let memberDB = new MemberManager(req, res)
//     let query = req.body
//     memberDB.login(query)
// })
router.post('/login', passport_1.default.authenticate('local', {
    successRedirect: '/login/result/success',
    failureRedirect: '/login/result/fail',
    failureFlash: true
}));
//로그아웃
router.post('/logout', function (req, res) {
    let memberDB = new MemberManager_1.default(req, res);
    let query = req.body;
    memberDB.logout(query);
});
router.post('/modify', function (req, res) {
});
router.post('/withdraw', function (req, res) {
});
router.post('/coupon/inquiry', function (req, res) {
});
router.post('/coupon/use', function (req, res) {
});
module.exports = router;
