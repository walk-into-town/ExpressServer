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
 * /campaign/coupon
 */
const express = __importStar(require("express"));
const CouponManager_1 = __importDefault(require("../../modules/DBManager/CouponManager"));
const UploadFile_1 = __importDefault(require("../../modules/FileManager/UploadFile"));
const dotenv = __importStar(require("dotenv"));
const authentication_1 = __importDefault(require("../../middlewares/authentication"));
let fileMan = new UploadFile_1.default();
let upload = fileMan.testupload();
var router = express.Router();
dotenv.config();
router.post('/', authentication_1.default, upload.array('img'), function (req, res) {
    let couponDB = new CouponManager_1.default(req, res);
    let query = JSON.parse(req.body.json);
    let imgs = [];
    for (let i = 0; i < req.files.length; i++) {
        imgs.push(process.env.domain + req.files[i].filename);
    }
    query.img = imgs;
    couponDB.insert(query);
});
router.get('/', function (req, res) {
    let couponDB = new CouponManager_1.default(req, res);
    let query = req.query;
    if (query.type == 'single') {
        couponDB.read(query);
    }
    if (query.type == 'list') {
        couponDB.readList(query);
    }
});
router.delete('/', authentication_1.default, function (req, res) {
    let couponDB = new CouponManager_1.default(req, res);
    let query = req.body;
    console.log(query);
    couponDB.delete(query);
});
router.put('/', authentication_1.default, upload.array('img'), function (req, res) {
    let couponDB = new CouponManager_1.default(req, res);
    let query = JSON.parse(req.body.json);
    let imgs = [];
    for (let i = 0; i < req.files.length; i++) {
        imgs.push(process.env.domain + req.files[i].filename);
    }
    query.imgs = imgs;
    couponDB.update(query);
});
module.exports = router;
