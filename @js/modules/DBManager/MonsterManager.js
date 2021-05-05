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
const FeatureManager_1 = require("./FeatureManager");
class MonsterManager extends FeatureManager_1.FeatureManager {
    insert(params) {
        params.number = parseInt(params.number);
        var queryParams = {
            TableName: 'Monster',
            Key: { 'number': 100 },
            UpdateExpression: 'set imgs = list_append(imgs, :newimgs)',
            ExpressionAttributeValues: { ':newimgs': params.imgs },
            ExpressionAttributeNames: { '#number': 'number' },
            ReturnValues: 'UPDATED_NEW',
            ConditionExpression: "attribute_exists(#number)"
        };
        const run = () => __awaiter(this, void 0, void 0, function* () {
            try {
                let data = yield this.Dynamodb.update(queryParams).promise();
                let result = {
                    result: 'success',
                    message: data.Attributes.imgs
                };
                this.res.status(200).send(result);
            }
            catch (err) {
                let result = {
                    result: 'failed',
                    error: 'DB Error. Please Connect Manager',
                    errcode: err
                };
                this.res.status(400).send(result);
            }
        });
        run();
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
}
exports.default = MonsterManager;
