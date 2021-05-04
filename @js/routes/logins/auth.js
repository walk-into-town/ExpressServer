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
/**
 * /auth
 */
const express = __importStar(require("express"));
var router = express.Router();
var passport = require('passport');
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email'],
    accessType: 'offline'
}));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: 'login/result/fail' }), function (req, res) {
    console.log(`응답 JSON\n${JSON.stringify(req.user, null, 2)}`);
    res.send(req.user);
});
module.exports = router;
