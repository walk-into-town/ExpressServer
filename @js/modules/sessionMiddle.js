"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionCheck = void 0;
const SessionManager_1 = __importDefault(require("./DBManager/SessionManager"));
const sessionCheck = function (req, res, next) {
    if (req.originalUrl == '/member/login') { //로그인 요청시
        let params = JSON.parse(req.body.json);
        if (req.session == undefined) { //세션 없이 로그인 시 기존에 로그인된 세션 삭제
            let sessman = new SessionManager_1.default(this.req, this.res);
            sessman.findByUId(params.id).then(function () {
                sessman.deleteSession(this.res.locals.result);
            }.bind(this));
            next();
            return;
        }
        if (req.session.user.id != undefined) { //세션의 id가 존재 = 이미 로그인함
            let result = {
                result: 'failed',
                error: 'Already logged in'
            };
            res.status(400).send(result);
            return;
        }
        next();
        return;
    }
    if (req.session == undefined) { //로그인 제외 요청시
        let result = {
            result: 'failed',
            error: 'Session Expired'
        };
        res.status(200).send();
        return;
    }
    next();
};
exports.sessionCheck = sessionCheck;
