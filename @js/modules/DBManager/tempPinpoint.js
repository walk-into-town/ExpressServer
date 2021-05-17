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
const FeatureManager_1 = require("./FeatureManager");
const CryptoJS = __importStar(require("crypto-js"));
const result_1 = require("../../static/result");
class PinpointManager extends FeatureManager_1.FeatureManager {
    read(params, ReadType) {
        throw new Error("Method not implemented.");
    }
    update(params) {
        throw new Error("Method not implemented.");
    }
    delete(params) {
        throw new Error("Method not implemented.");
    }
    /**
     * 핀포인트 등록 로직
     * 1. 핀포인트 이름, 위/경도로 hash id 생성
     * 2. 해당 id를 이용해 DB Insert
     * 3. ConditionExpression을 통해 id가 중복되면 실패
     */
    insert(params) {
        let date = new Date();
        let hash = CryptoJS.SHA256(params.name + params.latitude.toString() + params.longitude.toString() + date.toString()); //id 생성
        params.id = hash.toString(CryptoJS.enc.Base64);
        let time = new Date();
        params.updateTime = time.toISOString();
        if (params.coupons == undefined) {
            params.coupons = [];
        }
        var queryParams = {
            TableName: 'Pinpoint',
            Item: {
                id: params.id,
                name: params.name,
                imgs: params.imgs,
                latitude: params.latitude,
                longitude: params.longitude,
                updateTime: params.updateTime,
                description: params.description,
                quiz: params.quiz,
                coupons: params.coupons,
                comments: []
            },
            ConditionExpression: "attribute_not_exists(id)" // 항목 추가하기 전에 이미 존재하는 항목이 있을 경우 pk가 있을 때 조건 실패. pk는 반드시 있어야 하므로 replace를 방지
        };
        const run = () => __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(`DB 요청 params\n${JSON.stringify(queryParams, null, 2)}`);
                this.res.locals.id = params.id;
                this.res.locals.pids.push(params.id);
                let queryResult = yield this.Dynamodb.put(queryParams).promise();
                this.res.locals.pinpoints.push(params.id);
                console.log(`등록 완료,\n 생성된 핀포인트 id : ${params.id}`);
            }
            catch (err) {
                for (const id of this.res.locals.cids) {
                    let deleteParams = {
                        TableName: 'Coupon',
                        Key: {
                            'id': id
                        }
                    };
                    yield this.Dynamodb.delete(deleteParams).promise();
                }
                for (const id of this.res.locals.pids) {
                    let deleteParams = {
                        TableName: 'Pinpoint',
                        Key: {
                            'id': id
                        }
                    };
                    yield this.Dynamodb.delete(deleteParams).promise();
                }
                result_1.fail.error = result_1.error.invalReq;
                result_1.fail.errdesc = err;
                this.res.status(400).send(result_1.fail);
            }
        });
        return run;
    }
}
exports.default = PinpointManager;
