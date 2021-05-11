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
const FeatureManager_1 = require("./FeatureManager");
const SessionManager_1 = __importDefault(require("./SessionManager"));
const bcrypt = __importStar(require("bcrypt"));
const result_1 = require("../../static/result");
class MemberManager extends FeatureManager_1.FeatureManager {
    /**
     * 회원가입 로직
     * 1. 입력한 pw를 bcrypt를 이용해 DB에 저장할 pw 생성
     * 2. 생성된 pw를 이용해 DB에 Insert
     * 3. ConditionExpression을 통해 id가 중복되는 경우 실패
     */
    insert(params) {
        let pw;
        let saltRounds = 10;
        const run = () => __awaiter(this, void 0, void 0, function* () {
            try {
                let checkparams = {
                    TableName: 'Member',
                    IndexName: 'nicknameIndex',
                    KeyConditionExpression: 'nickname = :value',
                    ExpressionAttributeValues: { ':value': params.nickname },
                };
                let checkResult = yield this.Dynamodb.query(checkparams).promise();
                console.log(checkResult.Items);
                if (checkResult.Items.length != 0) {
                    result_1.fail.error = result_1.error.invalReq;
                    result_1.fail.errdesc = '닉네임이 중복되었어요.';
                    this.res.status(400).send(result_1.fail);
                    return;
                }
                yield bcrypt.hash(params.pw, saltRounds).then(function (hash) {
                    pw = hash;
                });
                var queryParams = {
                    TableName: 'Member',
                    Item: {
                        id: params.id,
                        pw: pw,
                        profileImg: process.env.domain + 'defaultProfileImg.jpg',
                        nickname: params.nickname,
                        isManager: params.isManager
                    },
                    ConditionExpression: "attribute_not_exists(id)" //항목 추가하기 전에 이미 존재하는 항목이 있을 경우 pk가 있을 때 조건 실패. pk는 반드시 있어야 하므로 replace를 방지
                };
                this.Dynamodb.put(queryParams, this.onInsert.bind(this));
            }
            catch (err) {
                result_1.fail.error = result_1.error.dbError;
                result_1.fail.errdesc = err;
                this.res.status(402).send(result_1.fail);
            }
        });
        run();
    }
    onInsert(err, data) {
        if (err) {
            result_1.fail.error = result_1.error.invalReq;
            result_1.fail.errdesc = 'ID가 중복되었어요.';
            this.res.status(400).send(err);
        }
        else {
            result_1.success.data = '회원가입 성공';
            this.res.status(201).send(result_1.success);
        }
    }
    /**
     * logout 로직
     * 1. sessionManager에서 세션 id로 검색
     * 2. 검색 결과의 사용자 id가 입력받은 사용자의 id와 동일한지 검증
     * 3. 동일한 경우 세션 삭제
     * 4. 다른 경우 잘못된 접근 경고
     */
    logout(params) {
        let id = params.id;
        let sessman = new SessionManager_1.default(this.req, this.res);
        const run = () => __awaiter(this, void 0, void 0, function* () {
            try {
                yield sessman.findBySId(this.req.session.id);
                if (this.res.locals.result == undefined) {
                    result_1.fail.error = result_1.error.invalAcc;
                    result_1.fail.errdesc = '먼저 로그인 해주세요';
                    this.res.status(400).send(result_1.fail);
                    return;
                }
                let json = JSON.parse(this.res.locals.result.sess);
                let findId = json.passport.user.id;
                if (findId == id) {
                    this.req.session.destroy(() => {
                        this.req.session;
                    });
                    result_1.success.data = params.id;
                    console.log('로그아웃 성공');
                    console.log(`응답 JSON\n${JSON.stringify(result_1.success, null, 2)}`);
                    this.res.status(200).send(result_1.success);
                }
                else {
                    result_1.fail.error = result_1.error.invalReq;
                    result_1.fail.errdesc = '잘못된 ID입니다.';
                    this.res.status(400).send(result_1.fail);
                }
            }
            catch (err) {
                result_1.fail.error = result_1.error.dbError;
                result_1.fail.errdesc = err;
                this.res.status(402).send(result_1.fail);
            }
        });
        run();
    }
    findMember(id) {
    }
    read(params) {
        throw new Error("Method not implemented.");
    }
    update(params) {
        throw new Error("Method not implemented.");
    }
    delete(params) {
        throw new Error("Method not implemented.");
    }
    check(type, params) {
        let index = null;
        let value = null;
        switch (type) {
            case 'id':
                value = params.id;
                break;
            case 'nickname':
                index = 'nicknameIndex';
                value = params.nickname;
                break;
            default:
                break;
        }
        params = {
            TableName: 'Member',
            IndexName: index,
            KeyConditionExpression: `${type} = :value`,
            ExpressionAttributeValues: { ':value': value },
        };
        const run = () => __awaiter(this, void 0, void 0, function* () {
            try {
                let queryResult = yield this.Dynamodb.query(params).promise();
                if (queryResult.Items.length == 0) {
                    result_1.success.data = '중복되었어요';
                    this.res.status(201).send(result_1.success);
                    return;
                }
                else {
                    result_1.success.data = '가능해요';
                    this.res.status(201).send(result_1.success);
                    return;
                }
            }
            catch (err) {
                result_1.fail.error = result_1.error.dbError;
                result_1.fail.errdesc = err;
                this.res.status(400).send(result_1.fail);
            }
        });
        run();
    }
}
exports.default = MemberManager;
