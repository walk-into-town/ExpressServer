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
const result_1 = require("../../static/result");
const CryptoJS = __importStar(require("crypto-js"));
const FeatureManager_1 = require("./FeatureManager");
const nbsp_1 = require("../Logics/nbsp");
class Reportmanager extends FeatureManager_1.FeatureManager {
    insert(params) {
        let hash = CryptoJS.SHA256(Date().toString() + params.targetId + Math.random());
        let id = hash.toString(CryptoJS.enc.Base64);
        let targetId = params.targetId;
        let userId = this.req.session.passport.user.id;
        let targetUser = params.targetUser;
        let description = params.description;
        let type = params.type;
        let typeId = params.typeId;
        let processed = false;
        let date = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString();
        let getParam = {
            TableName: params.type,
            KeyConditionExpression: 'id = :id',
            ExpressionAttributeValues: { ':id': typeId },
            ProjectionExpression: 'comments'
        };
        let memberParam = {
            TableName: 'Member',
            KeyConditionExpression: 'id = :id',
            ExpressionAttributeValues: { ':id': targetUser }
        };
        let reportParam = {
            TableName: 'Report'
        };
        let insertParams = {
            TableName: 'Report',
            Item: {
                id: id,
                targetId: targetId,
                description: description,
                userId: userId,
                targetUser: targetUser,
                date: date,
                type: type,
                processed: processed
            },
            ConditionExpression: "attribute_not_exists(id)" //항목 추가하기 전에 이미 존재하는 항목이 있을 경우 pk가 있을 때 조건 실패. pk는 반드시 있어야 하므로 replace를 방지
        };
        const run = () => __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('요청 유효성 검사중');
                console.log('type 유효성 검사중');
                if (type != 'Campaign' && type != 'Pinpoint') { // type이 잘못된 경우
                    console.log('잘못된 type');
                    result_1.fail.error = result_1.error.typeMiss;
                    result_1.fail.errdesc = 'type은 Campaign || Pinpoint 중 하나여야 합니다.';
                    this.res.status(400).send(result_1.fail);
                    return;
                }
                console.log('type 유효성 검사 통과');
                console.log('typeId 유효성 검사중');
                let result = yield this.Dynamodb.query(getParam).promise();
                if (result.Items[0] == undefined) {
                    console.log('typeid를 찾을 수 없습니다.');
                    result_1.fail.error = result_1.error.dataNotFound;
                    result_1.fail.errdesc = 'typeid를 찾을 수 없습니다.';
                    this.res.status(400).send(result_1.fail);
                    return;
                }
                console.log('targetUser 유효성 검사중');
                let memberResult = yield this.Dynamodb.query(memberParam).promise();
                if (memberResult.Items[0] == undefined) {
                    result_1.fail.error = result_1.error.dataNotFound;
                    result_1.fail.errdesc = 'targetUser를 찾을 수 없습니다.';
                    this.res.status(400).send(result_1.fail);
                    return;
                }
                console.log('targetUser 유효성 검사 통과');
                let comments = result.Items[0].comments;
                console.log('typeId 유효성 검사 통과');
                console.log('targetId 유효성 검사중');
                for (let i = 0; i < comments.length; i++) {
                    if (comments[i].id == targetId) {
                        if (comments[i].userId != targetUser) {
                            console.log('targetUser가 잘못되었습니다.');
                            result_1.fail.error = result_1.error.invalReq;
                            result_1.fail.errdesc = 'targetUser가 잘못되었습니다.';
                            this.res.status(400).send(result_1.fail);
                            return;
                        }
                        console.log('targetId 유효함');
                        break;
                    }
                    if (i == comments.length - 1) {
                        console.log('targetId를 찾을 수 없습니다.');
                        result_1.fail.error = result_1.error.dataNotFound;
                        result_1.fail.errdesc = 'targetId를 찾을 수 없습니다.';
                        this.res.status(400).send(result_1.fail);
                        return;
                    }
                }
                console.log('targetId 요효성 검사 통과');
                console.log('중복 신고 여부 확인중');
                let reportResult = yield this.Dynamodb.scan(reportParam).promise();
                let reports = reportResult.Items;
                for (const report of reports) {
                    if (report.targetId == targetId && report.targetUser == targetUser && report.userId == userId) {
                        result_1.fail.error = result_1.error.invalReq;
                        result_1.fail.errdesc = '이미 신고하신 댓글입니다.';
                        this.res.status(400).send(result_1.fail);
                        return;
                    }
                }
                console.log('신고 등록 시작');
                yield this.Dynamodb.put(insertParams).promise();
                console.log('신고 등록 성공');
                result_1.success.data = id;
                this.res.status(201).send(result_1.success);
            }
            catch (err) {
                result_1.fail.error = result_1.error.dbError;
                result_1.fail.errdesc = err;
                this.res.status(521).send(result_1.fail);
            }
        });
        run();
    }
    read(params, ReadType) {
        params.type = nbsp_1.nbsp2plus(params.type);
        let type = params.type;
        if (type != 'list' && type != 'single') {
            result_1.fail.error = result_1.error.typeMiss;
            result_1.fail.errdesc = 'type은 list | single 중 하나여야합니다.';
            this.res.status(400).send(result_1.fail);
            return;
        }
        const run = () => __awaiter(this, void 0, void 0, function* () {
            try {
                if (type == 'list') {
                    let queryParams = {
                        TableName: 'Report'
                    };
                    let result = yield this.Dynamodb.scan(queryParams).promise();
                    result_1.success.data = result.Items;
                    this.res.status(200).send(result_1.success);
                    return;
                }
                else {
                    params.reid = nbsp_1.nbsp2plus(params.reid);
                    let queryParams = {
                        TableName: 'Report',
                        KeyConditionExpression: 'id = :id',
                        ExpressionAttributeValues: { ':id': params.reid }
                    };
                    let result = yield this.Dynamodb.query(queryParams).promise();
                    if (result.Items[0] == undefined) {
                        result_1.fail.error = result_1.error.dataNotFound;
                        result_1.fail.errdesc = '신고를 찾을 수 없습니다.';
                        this.res.status(400).send(result_1.fail);
                        return;
                    }
                    result_1.success.data = result.Items[0];
                    this.res.status(200).send(result_1.success);
                }
            }
            catch (err) {
                result_1.fail.error = result_1.error.dbError;
                result_1.fail.errdesc = err;
                this.res.status(521).send(result_1.fail);
            }
        });
        run();
    }
    update(params) {
        let id = params.reid;
        let uid = this.req.session.passport.user.id;
        let time = Number(params.time);
        let targetUser = params.targetUser;
        let startTime = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString();
        if (time < 0 || params.time == undefined) {
            console.log('시간이 잘못되었습니다.');
            result_1.fail.error = result_1.error.invalReq;
            result_1.fail.errdesc = '시간이 잘못되었습니다.';
            this.res.status(400).send(result_1.fail);
            return;
        }
        let reportParam = {
            TableName: 'Report',
            KeyConditionExpression: 'id = :id',
            ExpressionAttributeValues: { ':id': params.reid }
        };
        let insertParam = {
            TableName: 'Prison',
            Item: {
                id: targetUser,
                time: time,
                startTime: startTime
            },
            ConditionExpression: "attribute_not_exists(id)" //항목 추가하기 전에 이미 존재하는 항목이 있을 경우 pk가 있을 때 조건 실패. pk는 반드시 있어야 하므로 replace를 방지
        };
        let updateParam = {
            TableName: 'Report',
            Key: { id: id },
            UpdateExpression: 'set #processed = :processed',
            ExpressionAttributeValues: { ':processed': true },
            ExpressionAttributeNames: { '#processed': 'processed' }
        };
        const run = () => __awaiter(this, void 0, void 0, function* () {
            try {
                let result = yield this.Dynamodb.query(reportParam).promise();
                if (result.Items[0] == undefined) {
                    result_1.fail.error = result_1.error.dataNotFound;
                    result_1.fail.errdesc = '신고를 찾을 수 없습니다.';
                    this.res.status(400).send(result_1.fail);
                    return;
                }
                if (result.Items[0].targetUser != targetUser) {
                    result_1.fail.error = result_1.error.invalReq;
                    result_1.fail.errdesc = '잘못된 targetUser입니다.';
                    this.res.status(400).send(result_1.fail);
                    return;
                }
                yield this.Dynamodb.put(insertParam).promise();
                yield this.Dynamodb.update(updateParam).promise();
                result_1.success.data = '신고 처리 완료!';
                this.res.status(201).send(result_1.success);
            }
            catch (err) {
                result_1.fail.error = result_1.error.dbError;
                result_1.fail.errdesc = err;
                this.res.status(521).send(result_1.fail);
            }
        });
        run();
    }
    delete(params) {
        throw new Error("Method not implemented.");
    }
}
exports.default = Reportmanager;
