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
        try {
            if (params.type == 'single') {
                let queryParams = {
                    TableName: 'Ranking',
                    KeyConditionExpression: 'id = :id',
                    ExpressionAttributeValues: { ':id': this.req.session.passport.user.id }
                };
                const run = () => __awaiter(this, void 0, void 0, function* () {
                    let result = yield this.Dynamodb.query(queryParams).promise();
                    result_1.success.data = result.Items[0];
                    return;
                });
                run();
                return;
            }
            if (params.type == 'list') {
                let queryParams = {
                    TableName: 'Ranking'
                };
                const run = () => __awaiter(this, void 0, void 0, function* () {
                    let result = yield this.Dynamodb.scan(queryParams).promise();
                    let ranking = [];
                    for (const item of result.Items) {
                        ranking.push(item);
                    }
                    ranking = yield Sorter_1.rankingSort(ranking);
                    result_1.success.data = ranking;
                    this.res.status(200).send(result_1.success);
                    return;
                });
                run();
                return;
            }
            result_1.fail.error = result_1.error.invalReq;
            result_1.fail.errdesc = 'type은 single | list 중 하니이어야 합니다.';
            this.res.status(400).send(result_1.fail);
        }
        catch (err) {
            result_1.fail.error = result_1.error.dbError;
            result_1.fail.errdesc = err;
            this.res.status(521).send(result_1.fail);
        }
    }
    update(params) {
        throw new Error("Method not implemented.");
    }
    delete(params) {
        throw new Error("Method not implemented.");
    }
}
exports.default = Rankingmanager;
