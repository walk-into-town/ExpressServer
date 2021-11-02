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
Object.defineProperty(exports, "__esModule", { value: true });
const express = __importStar(require("express"));
var router = express.Router();
const campaign = require('./campaign/campaign');
const game = require('./game/game');
const member = require('./member/member');
const manager = require('./manager/manager');
const auth = require('./logins/auth');
const loginResult = require('./logins/result');
const debug = require('./debug');
const coupon = require('./coupon/coupon');
const pinpoint = require('./pinpoint/pinpoint');
const monster = require('./monster/monster');
const file = require('./file/file');
router.use('/campaign', campaign);
router.use('/pinpoint', pinpoint);
router.use('/coupon', coupon);
router.use('/game', game);
router.use('/monster', monster);
router.use('/member', member);
router.use('/manager', manager);
router.use('/auth', auth);
router.use('/login/result', loginResult);
router.use('/debug', debug);
router.use('/file', file);
module.exports = router;
