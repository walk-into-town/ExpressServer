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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemberManager = void 0;
const FeatureManager_1 = require("./FeatureManager");
const SessionManager_1 = require("./SessionManager");
const bcrypt = __importStar(require("bcrypt"));
class MemberManager extends FeatureManager_1.FeatureManager {
    /**
     * 로그인 로직
     * 1. get을 통해 id의 pw만 가져온 후
     * 2. db의 비밀번호와 입력받은 비밀번호의 일치를 확인한 후
     * 3. 일치하는 경우 현재 시간 + id로 생성한 해시값을 토큰으로 넘겨줌
     */
    login(params) {
        let id = params.id;
        let pw = params.pw;
        let isIdValid;
        let dbpw;
        /**
         * 이미 로그인한 ID로 로그인을 시도하는지 확인
         */
        let sessman = new SessionManager_1.SessionManager(this.req, this.res);
        sessman.findByUId(id).then(function () {
            sessman.deleteSession(this.res.locals.result);
        }.bind(this));
        /**
         * id가 일치하는지 확인
         */
        function onGet(err, data) {
            let result;
            if (err) { //db에러 발생
                result = {
                    result: 'failed',
                    error: err
                };
                this.res.status(400).send(result);
                isIdValid = false;
                return;
            }
            if (data.Item == undefined) { //id와 일치하는 항목 없음
                result = {
                    result: 'failed',
                    error: 'Invalid User Id'
                };
                this.res.status(400).send(result);
                isIdValid = false;
                return;
            }
            else { //일치하면 isIdValid = true, dbpw = pw
                isIdValid = true;
                dbpw = data.Item.pw;
            }
        }
        /**
         * 토큰 생성 처리
         */
        function onCreteToken(err, hash) {
            this.req.session.token = hash; //세션의 토큰에 생성된 토큰
            this.req.session.user = {
                id: params.id
            };
            this.req.session.save();
            let result = {
                result: 'success'
            };
            this.res.status(200).send(result);
        }
        let queryParams = {
            TableName: 'Member',
            Key: {
                'id': params.id,
            },
            ProjectionExpression: 'pw'
        };
        /**
         * 비동기 처리
         * 상기한 내용대에 따라 순서대로 처리
         */
        const run = () => __awaiter(this, void 0, void 0, function* () {
            yield this.Dynamodb.get(queryParams, onGet.bind(this)).promise();
            if (isIdValid == false) {
                return;
            }
            const match = yield bcrypt.compare(pw, dbpw);
            if (match == true) {
                yield bcrypt.hash(Date.now().toString() + params.id, 10).then(onCreteToken.bind(this));
            }
            else {
                let result = {
                    result: 'failed',
                    error: 'Password mismatch'
                };
                this.res.status(400).send(result);
            }
        });
        run();
    }
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
            yield bcrypt.hash(params.pw, saltRounds).then(function (hash) {
                pw = hash;
            });
            var queryParams = {
                TableName: 'Member',
                Item: {
                    id: params.id,
                    pw: pw,
                    nickname: params.nickname,
                    isManager: params.isManager
                },
                ConditionExpression: "attribute_not_exists(id)" //항목 추가하기 전에 이미 존재하는 항목이 있을 경우 pk가 있을 때 조건 실패. pk는 반드시 있어야 하므로 replace를 방지
            };
            this.Dynamodb.put(queryParams, this.onInsert.bind(this));
        });
        run();
    }
    onInsert(err, data) {
        if (err) {
            let result = {
                result: 'failed',
                error: err
            };
            this.res.status(400).send(result);
        }
        else {
            let result = {
                result: 'success',
                message: 'register success'
            };
            this.res.status(201).send(result);
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
        let sessman = new SessionManager_1.SessionManager(this.req, this.res);
        const run = () => __awaiter(this, void 0, void 0, function* () {
            yield sessman.findBySId(this.req.session.id);
            let json = JSON.parse(this.res.locals.result.sess);
            let findId = json.user.id;
            if (findId == id) {
                this.req.session.destroy(() => {
                    this.req.session;
                });
                let result = {
                    result: 'success',
                    message: params.id
                };
                this.res.status(200).send(result);
            }
        });
        run();
    }
    read(params, readType) {
        throw new Error("Method not implemented.");
    }
    update(params) {
        throw new Error("Method not implemented.");
    }
    delete(params) {
        throw new Error("Method not implemented.");
    }
}
exports.MemberManager = MemberManager;
