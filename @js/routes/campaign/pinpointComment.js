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
 * /campaign/evaluate/pinpoint/comment
 */
const express = __importStar(require("express"));
const authentication_1 = __importDefault(require("../../middlewares/authentication"));
const UploadFile_1 = __importDefault(require("../../modules/FileManager/UploadFile"));
const PinpointManager_1 = __importDefault(require("../../modules/DBManager/PinpointManager"));
let uploader = new UploadFile_1.default();
let upload = uploader.testupload();
var router = express.Router();
router.post('/', authentication_1.default, upload.array('img'), function (req, res) {
    let query = req.body;
    let imgs = [];
    if (req.files != undefined) {
        for (let i = 0; i < req.files.length; i++) {
            imgs.push(process.env.domain + req.files[i].filename);
        }
    }
    query.imgs = imgs;
    let pinpointDB = new PinpointManager_1.default(req, res);
    console.log(query);
    pinpointDB.insertComment(query);
});
router.get('/', function (req, res) {
    let query = req.query;
    let pinpointDB = new PinpointManager_1.default(req, res);
    pinpointDB.readComment(query);
});
router.delete('/', authentication_1.default, function (req, res) {
    let query = req.body;
    let pinpointDB = new PinpointManager_1.default(req, res);
    pinpointDB.deleteComment(query);
});
router.put('/', authentication_1.default, function (req, res) {
    let query = req.body;
    let pinpointDB = new PinpointManager_1.default(req, res);
    pinpointDB.updateComment(query);
});
router.put('/rate', authentication_1.default, function (req, res) {
    let query = req.body;
    let pinpointDB = new PinpointManager_1.default(req, res);
    pinpointDB.updateRate(query);
});
module.exports = router;
