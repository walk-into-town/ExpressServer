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
const CouponManager_1 = __importDefault(require("../../modules/DBManager/CouponManager"));
const UploadFile_1 = __importDefault(require("../../modules/FileManager/UploadFile"));
let fileMan = new UploadFile_1.default();
let upload = fileMan.testupload();
var router = express.Router();
router.post('/register', upload.single('img'), function (req, res) {
    let couponDB = new CouponManager_1.default(req, res);
    let params = JSON.parse(req.body.json);
    if (req.file != undefined) {
        params.img = `https://walk-into-town.ga/${req.file.filename}`;
    }
    couponDB.insert(params);
});
router.post('/inquiry', function (req, res) {
    let couponDB = new CouponManager_1.default(req, res);
    let params = JSON.parse(req.body.json);
    couponDB.read(params);
});
router.post('/delete', function (req, res) {
});
router.post('/modify', function (req, res) {
});
module.exports = router;
