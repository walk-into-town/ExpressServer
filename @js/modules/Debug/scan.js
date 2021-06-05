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
var aws = require('aws-sdk');
var dotenv = require('dotenv');
dotenv.config();
aws.config.update({
    accessKeyId: process.env.aws_access_key_id,
    secretAccessKey: process.env.aws_secret_access_key,
    region: 'us-east-1',
    endpoint: 'http://localhost:8000'
});
let doclient = new aws.DynamoDB.DocumentClient();
class Scan {
    constructor(req, res) {
        this.req = req;
        this.res = res;
    }
    campaign() {
        const run = () => __awaiter(this, void 0, void 0, function* () {
            let result = yield doclient.scan({ TableName: "Campaign" }).promise();
            console.log(result.Items);
            result_1.success.data = result.Items;
            this.res.status(200).send(result_1.success);
        });
        run();
    }
    pinpoint() {
        const run = () => __awaiter(this, void 0, void 0, function* () {
            let result = yield doclient.scan({ TableName: "Pinpoint" }).promise();
            console.log(result.Items);
            result_1.success.data = result.Items;
            this.res.status(200).send(result_1.success);
        });
        run();
    }
    coupon() {
        const run = () => __awaiter(this, void 0, void 0, function* () {
            let result = yield doclient.scan({ TableName: "Coupon" }).promise();
            console.log(result.Items);
            result_1.success.data = result.Items;
            this.res.status(200).send(result_1.success);
        });
        run();
    }
    member() {
        const run = () => __awaiter(this, void 0, void 0, function* () {
            let result = yield doclient.scan({ TableName: "Member" }).promise();
            console.log(result.Items);
            result_1.success.data = result.Items;
            this.res.status(200).send(result_1.success);
        });
        run();
    }
    monster() {
        const run = () => __awaiter(this, void 0, void 0, function* () {
            let result = yield doclient.scan({ TableName: "Monster" }).promise();
            console.log(result.Items);
            result_1.success.data = result.Items;
            this.res.status(200).send(result_1.success);
        });
        run();
    }
    ranking() {
        const run = () => __awaiter(this, void 0, void 0, function* () {
            let result = yield doclient.scan({ TableName: "Ranking" }).promise();
            console.log(result.Items);
            result_1.success.data = result.Items;
            this.res.status(200).send(result_1.success);
        });
        run();
    }
    report() {
        const run = () => __awaiter(this, void 0, void 0, function* () {
            let result = yield doclient.scan({ TableName: 'Report' }).promise();
            console.log(result.Items);
            result_1.success.data = result.Items;
            this.res.status(200).send(result_1.success);
        });
        run();
    }
    prison() {
        const run = () => __awaiter(this, void 0, void 0, function* () {
            let result = yield doclient.scan({ TableName: 'Prison' }).promise();
            console.log(result.Items);
            result_1.success.data = result.Items;
            this.res.status(200).send(result_1.success);
        });
        run();
    }
}
exports.default = Scan;
