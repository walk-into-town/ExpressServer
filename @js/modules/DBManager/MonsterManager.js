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
const result_1 = require("../../static/result");
const responseInit_1 = require("../Logics/responseInit");
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
                result_1.success.data = data.Attributes.imgs;
                this.res.status(201).send(result_1.success);
                responseInit_1.successInit(result_1.success);
            }
            catch (err) {
                console.log(err);
                result_1.fail.error = result_1.error.dbError;
                result_1.fail.errdesc = err;
                this.res.status(521).send(result_1.fail);
            }
        });
        run();
    }
    read(params) {
        let queryParams = {
            TableName: 'Monster',
            KeyConditionExpression: '#number = :number',
            ExpressionAttributeNames: { '#number': 'number' },
            ProjectionExpression: 'imgs',
            ExpressionAttributeValues: { ':number': Number(params.number) },
        };
        console.log(`?????? JSON\n${JSON.stringify(queryParams, null, 2)}`);
        const run = () => __awaiter(this, void 0, void 0, function* () {
            try {
                let result = yield this.Dynamodb.query(queryParams).promise();
                let url = null;
                const getRandomNumber = () => {
                    return Math.floor(Math.random() * (result.Items[0].imgs.length - 0)) + 0;
                };
                url = result.Items[0].imgs[getRandomNumber()];
                let test = url.substr(url.length - 14, 14);
                let debugUrl = process.env.domain + 'images/' + test;
                console.log(debugUrl);
                result_1.success.data = debugUrl;
                this.res.status(200).send(result_1.success);
                responseInit_1.successInit(result_1.success);
            }
            catch (err) {
                console.log(err);
                result_1.fail.error = result_1.error.dbError;
                result_1.fail.errdesc = err;
                this.res.status(521).send(result_1.fail);
            }
        });
        run();
    }
    update(params) {
        throw new Error("Method not implemented.");
    }
    delete(params) {
        throw new Error("Method not implemented.");
    }
}
exports.default = MonsterManager;
