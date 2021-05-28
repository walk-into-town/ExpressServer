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
 * /pinpoint/quiz
 */
const express = __importStar(require("express"));
const PinpointManager_1 = __importDefault(require("../../modules/DBManager/PinpointManager"));
const authentication_1 = __importDefault(require("../../middlewares/authentication"));
var router = express.Router();
router.post('/', authentication_1.default, function (req, res) {
    let query = req.body;
    let DBManager = new PinpointManager_1.default(req, res);
    DBManager.insertQuiz(query);
});
router.get('/', function (req, res) {
    let query = req.query;
    let DBManager = new PinpointManager_1.default(req, res);
    DBManager.readQuiz(query);
});
router.delete('/', authentication_1.default, function (req, res) {
    let query = req.body;
    query.quiz = null;
    let DBManager = new PinpointManager_1.default(req, res);
    DBManager.updateQuiz(query);
});
router.put('/', authentication_1.default, function (req, res) {
    let query = req.body;
    let DBManager = new PinpointManager_1.default(req, res);
    DBManager.updateQuiz(query);
});
router.post('/check', authentication_1.default, function (req, res) {
    let query = req.body;
    let DBManager = new PinpointManager_1.default(req, res);
    DBManager.solveQuiz(query);
});
module.exports = router;
