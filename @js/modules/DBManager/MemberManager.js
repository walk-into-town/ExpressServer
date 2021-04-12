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
        let test = new SessionManager_1.SessionManager(this.req, this.res);
        test.findById(id).then(function () {
            test.deleteSession(test.result);
        });
        let queryParams = {
            TableName: 'Member',
            Key: {
                'id': params.id,
            },
            ProjectionExpression: 'pw'
        };
        function onGet(err, data) {
            let result;
            if (err) { //db에러 발생
                result = {
                    result: 'failed',
                    error: err
                };
                console.log('onget-err');
                this.res.status(400).send(result);
                isIdValid = false;
                return;
            }
            if (data.Item == undefined) { //id와 일치하는 항목 없음
                result = {
                    result: 'failed',
                    error: 'Invalid User Id'
                };
                console.log('onget-undefined');
                this.res.status(400).send(result);
                isIdValid = false;
                return;
            }
            else { //일치하면 isIdValid = true, dbpw = pw
                console.log('onget-success');
                isIdValid = true;
                dbpw = data.Item.pw;
            }
        }
        function onCreteToken(err, hash) {
            this.req.session.token = hash;
            this.req.session.user = {
                id: params.id
            };
            this.req.session.save();
            let result = {
                result: 'success'
            };
            console.log('on-create-token');
            this.res.status(200).send(result);
        }
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
                console.log('pwd missmatch');
                this.res.status(400).send(result);
            }
        });
        run();
        // this.Dynamodb.get(queryParams, function(err: object, data: any){    //DB에서 id에 맞는 pw를 가져오는 부분
        //     let result
        //     if(err){                            //가져오기 실패
        //         result = {
        //             result: 'failed',
        //             error: err
        //         }
        //         console.log(result)
        //         this.res.status(400).send(result)
        //         return;
        //     }
        //     if(data.Item == undefined){     //일치하는 id 없을 때
        //         let result = {
        //             result: 'failed',
        //             error: 'Invalid ID'
        //         }
        //         console.log(result)
        //         this.res.status(400).send(result)
        //         return;
        //     }
        //     let dbpw = data.Item.pw
        //     bcrypt.compare(pw, dbpw).then(function(result){         //일치하는 id를 찾고 입력받은 pw와 비교
        //         if(result == true){                                 //pw가 일치할 때, id + 현재 시각으로 토큰 발급
        //             bcrypt.hash(Date.now().toString() + params.id, 10, function(err, data){
        //                 bcrypt.hash(params.id + Date.now().toString(), 10).then(function(hash){
        //                     let result = {
        //                         result: 'success'
        //                     }
        //                     console.log(result)
        //                     this.req.session.token = hash
        //                     this.req.session.user = {
        //                         id: params.id
        //                     }
        //                     this.res.status(201).send(result)
        //                 }.bind(this))
        //             }.bind(this))
        //         }
        //         else{
        //             let result = {
        //                 result: 'failed',
        //                 error: 'Invalid Password'
        //             }
        //             console.log(result)
        //             this.res.status(400).send(result)
        //         }
        //     }.bind(this))
        // }.bind(this))
    }
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
