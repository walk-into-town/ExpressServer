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
const bcrypt = __importStar(require("bcrypt"));
class MemberManager extends FeatureManager_1.FeatureManager {
    login(params) {
        let id = params.id;
        let pw = params.pw;
        let queryParams = {
            TableName: 'Member',
            Key: {
                'id': id,
            },
            ProjectionExpression: 'pw'
        };
        this.Dynamodb.get(queryParams, function (err, data) {
            let result;
            if (err) {
                result = {
                    result: 'failed',
                    error: err
                };
                this.res.status(400).send(result);
            }
            let dbpw = data.Item.pw;
            bcrypt.compare(pw, dbpw).then(function (result) {
                if (result == true) {
                    let result = {
                        result: 'success'
                    };
                    bcrypt.hash(Date.now().toString() + params.id, 10, function (err, data) {
                        bcrypt.hash(params.id + Date.now().toString(), 10).then(function (hash) {
                            this.req.session.token = hash;
                            console.log(this.req.session.token);
                        }.bind(this));
                        this.res.status(201).send(result);
                    }.bind(this));
                }
                else {
                    let result = {
                        result: 'failed',
                        error: 'Invalid Password'
                    };
                    this.res.status(400).send(result);
                }
            }.bind(this));
        }.bind(this));
    }
    onLogin(err, data) {
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
                result: 'success',
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
