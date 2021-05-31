"use strict";
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
const Sorter_1 = require("../Logics/Sorter");
const FeatureManager_1 = require("./FeatureManager");
class Rankingmanager extends FeatureManager_1.FeatureManager {
    insert(params) {
        let rankParam = {
            TableName: 'Ranking',
            Key: { userId: this.req.session.passport.user.id },
            UpdateExpression: 'add cleared :clear',
            ExpressionAttributeValues: { ':clear': 1 }
        };
        const run = () => __awaiter(this, void 0, void 0, function* () {
            this.Dynamodb.update(rankParam, function (err, data) {
                if (err) {
                    throw err;
                }
            });
        });
        run();
    }
    read(params) {
        let uid = this.req.session.passport.user.id;
        if (params.type == 'single') {
            let queryParams = {
                TableName: 'Ranking',
                KeyConditionExpression: 'userId = :id',
                ExpressionAttributeValues: { ':id': uid }
            };
            let memberParams = {
                TableName: 'Member',
                KeyConditionExpression: 'id = :id',
                ExpressionAttributeValues: { ':id': uid },
                ProjectionExpression: 'nickname, profileImg'
            };
            const run = () => __awaiter(this, void 0, void 0, function* () {
                try {
                    let result = yield this.Dynamodb.query(queryParams).promise();
                    let ranking = result.Items[0];
                    let memberResult = yield this.Dynamodb.query(memberParams).promise();
                    let member = memberResult.Items[0];
                    ranking.nickname = member.nickname;
                    ranking.profileImg = member.profileImg;
                    this.res.status(200).send(ranking);
                    return;
                }
                catch (err) {
                    result_1.fail.error = result_1.error.dbError;
                    result_1.fail.errdesc = err;
                    this.res.status(521).send(result_1.fail);
                }
            });
            run();
            return;
        }
        if (params.type == 'list') {
            let queryParams = {
                TableName: 'Ranking'
            };
            let memberparams = {
                RequestItems: {
                    'Member': {
                        Keys: [],
                        ProjectionExpression: 'nickname, profileImg, id'
                    }
                }
            };
            const run = () => __awaiter(this, void 0, void 0, function* () {
                try {
                    let result = yield this.Dynamodb.scan(queryParams).promise();
                    let ranking = [];
                    for (const item of result.Items) {
                        ranking.push(item);
                    }
                    ranking = yield Sorter_1.rankingSort(ranking);
                    for (const rank of ranking) {
                        memberparams.RequestItems.Member.Keys.push({ id: rank.userId });
                    }
                    let memberResult = yield this.Dynamodb.batchGet(memberparams).promise();
                    let member = memberResult.Responses.Member;
                    for (const rank of ranking) {
                        for (let i = 0; i < member.length; i++) {
                            if (rank.userId == member[i].id) {
                                rank.nickname = member[i].nickname;
                                rank.profileImg = member[i].profileImg;
                                member.splice(i, 0);
                                break;
                            }
                        }
                    }
                    result_1.success.data = ranking;
                    this.res.status(200).send(result_1.success);
                    return;
                }
                catch (err) {
                    result_1.fail.error = result_1.error.dbError;
                    result_1.fail.errdesc = err;
                    this.res.status(521).send(result_1.fail);
                }
            });
            run();
            return;
        }
        result_1.fail.error = result_1.error.invalReq;
        result_1.fail.errdesc = 'type은 single | list 중 하니이어야 합니다.';
        this.res.status(400).send(result_1.fail);
    }
    update(params) {
        throw new Error("Method not implemented.");
    }
    delete(params) {
        throw new Error("Method not implemented.");
    }
}
exports.default = Rankingmanager;
