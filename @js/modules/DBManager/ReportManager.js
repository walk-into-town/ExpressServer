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
                typeId: typeId,
                processed: processed,
                imgs: null
            },
            ConditionExpression: "attribute_not_exists(id)" //?????? ???????????? ?????? ?????? ???????????? ????????? ?????? ?????? pk??? ?????? ??? ?????? ??????. pk??? ????????? ????????? ????????? replace??? ??????
        };
        const run = () => __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('?????? ????????? ?????????');
                console.log('type ????????? ?????????');
                if (type != 'Campaign' && type != 'Pinpoint') { // type??? ????????? ??????
                    console.log('????????? type');
                    result_1.fail.error = result_1.error.typeMiss;
                    result_1.fail.errdesc = 'type??? Campaign || Pinpoint ??? ???????????? ?????????.';
                    this.res.status(400).send(result_1.fail);
                    return;
                }
                console.log('type ????????? ?????? ??????');
                console.log('typeId ????????? ?????????');
                let result = yield this.Dynamodb.query(getParam).promise();
                if (result.Items[0] == undefined) {
                    console.log('typeid??? ?????? ??? ????????????.');
                    result_1.fail.error = result_1.error.dataNotFound;
                    result_1.fail.errdesc = 'typeid??? ?????? ??? ????????????.';
                    this.res.status(400).send(result_1.fail);
                    return;
                }
                console.log('targetUser ????????? ?????????');
                let memberResult = yield this.Dynamodb.query(memberParam).promise();
                if (memberResult.Items[0] == undefined) {
                    result_1.fail.error = result_1.error.dataNotFound;
                    result_1.fail.errdesc = 'targetUser??? ?????? ??? ????????????.';
                    this.res.status(400).send(result_1.fail);
                    return;
                }
                console.log('targetUser ????????? ?????? ??????');
                let comments = result.Items[0].comments;
                console.log('typeId ????????? ?????? ??????');
                console.log('targetId ????????? ?????????');
                for (let i = 0; i < comments.length; i++) {
                    if (comments[i].id == targetId) {
                        if (comments[i].userId != targetUser) {
                            console.log('targetUser??? ?????????????????????.');
                            result_1.fail.error = result_1.error.invalReq;
                            result_1.fail.errdesc = 'targetUser??? ?????????????????????.';
                            this.res.status(400).send(result_1.fail);
                            return;
                        }
                        insertParams.Item.imgs = comments[i].imgs;
                        console.log('targetId ?????????');
                        break;
                    }
                    if (i == comments.length - 1) {
                        console.log('targetId??? ?????? ??? ????????????.');
                        result_1.fail.error = result_1.error.dataNotFound;
                        result_1.fail.errdesc = 'targetId??? ?????? ??? ????????????.';
                        this.res.status(400).send(result_1.fail);
                        return;
                    }
                }
                console.log('targetId ????????? ?????? ??????');
                console.log('?????? ?????? ?????? ?????????');
                let reportResult = yield this.Dynamodb.scan(reportParam).promise();
                let reports = reportResult.Items;
                for (const report of reports) {
                    if (report.targetId == targetId && report.targetUser == targetUser && report.userId == userId) {
                        result_1.fail.error = result_1.error.invalReq;
                        result_1.fail.errdesc = '?????? ???????????? ???????????????.';
                        this.res.status(400).send(result_1.fail);
                        return;
                    }
                }
                console.log('?????? ?????? ??????');
                yield this.Dynamodb.put(insertParams).promise();
                console.log('?????? ?????? ??????');
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
        if (type != 'list' && type != 'single' && type != 'userId') {
            result_1.fail.error = result_1.error.typeMiss;
            result_1.fail.errdesc = 'type??? list | single ??? ?????????????????????.';
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
                if (type == 'userId') {
                    params.value = nbsp_1.nbsp2plus(params.value);
                    let scanParam = {
                        TableName: 'Report',
                        FilterExpression: 'userId = :id',
                        ExpressionAttributeValues: { ':id': params.value }
                    };
                    let result = yield this.Dynamodb.scan(scanParam).promise();
                    if (result.Items.length == 0) {
                        result_1.success.data = [];
                        this.res.status(200).send(result_1.success);
                        return;
                    }
                    result_1.success.data = result.Items;
                    this.res.status(200).send(result_1.success);
                    return;
                }
                else {
                    params.reid = nbsp_1.nbsp2plus(params.value);
                    let queryParams = {
                        TableName: 'Report',
                        KeyConditionExpression: 'id = :id',
                        ExpressionAttributeValues: { ':id': params.value }
                    };
                    let result = yield this.Dynamodb.query(queryParams).promise();
                    if (result.Items[0] == undefined) {
                        result_1.fail.error = result_1.error.dataNotFound;
                        result_1.fail.errdesc = '????????? ?????? ??? ????????????.';
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
        let time = Number(params.time);
        let targetUser = params.targetUser;
        let startTime = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString();
        if (time < 0 || params.time == undefined) {
            console.log('????????? ?????????????????????.');
            result_1.fail.error = result_1.error.invalReq;
            result_1.fail.errdesc = '????????? ?????????????????????.';
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
            ConditionExpression: "attribute_not_exists(id)" //?????? ???????????? ?????? ?????? ???????????? ????????? ?????? ?????? pk??? ?????? ??? ?????? ??????. pk??? ????????? ????????? ????????? replace??? ??????
        };
        let updateParam = {
            TableName: 'Report',
            Key: { id: id },
            UpdateExpression: 'set #processed = :processed',
            ExpressionAttributeValues: { ':processed': true },
            ExpressionAttributeNames: { '#processed': 'processed' }
        };
        let commentParam = {
            TableName: null,
            KeyConditionExpression: 'id = :id',
            ExpressionAttributeValues: { ':id': null },
            ProjectionExpression: 'comments'
        };
        let commentUpdateParam = {
            TableName: null,
            Key: { id: null },
            UpdateExpression: 'set comments = :newComment',
            ExpressionAttributeValues: { ':newComment': null }
        };
        const run = () => __awaiter(this, void 0, void 0, function* () {
            try {
                let result = yield this.Dynamodb.query(reportParam).promise();
                if (result.Items[0] == undefined) {
                    result_1.fail.error = result_1.error.dataNotFound;
                    result_1.fail.errdesc = '????????? ?????? ??? ????????????.';
                    this.res.status(400).send(result_1.fail);
                    return;
                }
                if (result.Items[0].targetUser != targetUser) {
                    result_1.fail.error = result_1.error.invalReq;
                    result_1.fail.errdesc = '????????? targetUser?????????.';
                    this.res.status(400).send(result_1.fail);
                    return;
                }
                if (result.Items[0].processed == true) {
                    result_1.fail.error = result_1.error.invalReq;
                    result_1.fail.errdesc = '?????? ????????? ???????????????.';
                    this.res.status(400).send(result_1.fail);
                    return;
                }
                console.log('?????? ?????? ??????');
                commentParam.TableName = result.Items[0].type;
                commentParam.ExpressionAttributeValues[":id"] = result.Items[0].typeId;
                let commentResult = yield this.Dynamodb.query(commentParam).promise();
                let comments = commentResult.Items[0];
                for (const comment of comments.comments) {
                    if (comment.id == result.Items[0].targetId) {
                        comment.text = '?????????????????? ?????????????????????.';
                        comment.imgs = [];
                        commentUpdateParam.TableName = result.Items[0].type;
                        commentUpdateParam.Key.id = result.Items[0].typeId;
                        commentUpdateParam.ExpressionAttributeValues[":newComment"] = comments.comments;
                        yield this.Dynamodb.update(commentUpdateParam).promise();
                        break;
                    }
                }
                console.log('?????? ?????? ??????');
                yield this.Dynamodb.put(insertParam).promise();
                yield this.Dynamodb.update(updateParam).promise();
                result_1.success.data = '?????? ?????? ??????!';
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
