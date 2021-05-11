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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * /login/result
 */
const express = __importStar(require("express"));
const SessionManager_1 = __importDefault(require("../../modules/DBManager/SessionManager"));
const result_1 = require("../../static/result");
var router = express.Router();
/**
 * 로그인 성공시 기존 세션 제거
 * ---> Session Middleware에서 처리했지만 passport적용 후 세션 생성 전에 작동하므로 에러 발생
 * 1. sessionManager에서 User Id 검색
 * 2. res.locals.result에 들어있는 session들을 순회하며
 * 3. 세션 id가 일치하고 user id가 일치하는 것을 제외하고 toDelete 배열에 삽입
 * 4. sessionManager의 deleteSession에 배열을 넣어 세션 삭제
 */
router.get('/success', function (req, res) {
    let id = req.session.passport.user.id;
    let sessman = new SessionManager_1.default(req, res);
    sessman.findByUId(id).then(() => __awaiter(this, void 0, void 0, function* () {
        let toDelete = [];
        const run = () => __awaiter(this, void 0, void 0, function* () {
            for (const session of res.locals.result) {
                let sess = JSON.parse(session.sess);
                let user = sess.passport.user;
                if ((user.id == req.session.passport.user.id)
                    && (session.id == `sess:${req.sessionID}`)) {
                    continue;
                }
                toDelete.push(session);
            }
        });
        yield run();
        sessman.deleteSession(toDelete);
        console.log('로그인 성공!');
    }));
    result_1.success.data = req.user;
    console.log(`응답 JSON\n${JSON.stringify(result_1.success, null, 2)}`);
    res.status(200).send(result_1.success);
});
router.get('/fail', function (req, res) {
    result_1.fail.error = req.flash().error[0];
    result_1.fail.errdesc = '로그인 실패';
    console.log('로그인 실패');
    res.status(402).send(result_1.fail);
});
module.exports = router;
