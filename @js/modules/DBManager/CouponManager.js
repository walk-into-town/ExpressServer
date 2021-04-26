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
class CouponManager extends FeatureManager_1.FeatureManager {
    /**
     * 쿠폰 등록 로직
     * 1. 상품의 수와 발급 제한 개수가 동일한지 확인
     * 2. 현재 시각을 이용해 id 생성
     * 3. DB에 추가
     * 4. 쿼리 결과에 따라 사용자에게 응답
     */
    insert(params) {
        if (params.goods.length != params.limit.length) {
            let result = {
                result: 'failed',
                error: 'amounts of goods and limit are different'
            };
            this.res.status(200).send(result);
            return;
        }
        let hash = CryptoJS.SHA256(Date().toString() + params.title);
        let id = hash.toString(CryptoJS.enc.Base64);
        var queryParams = {
            TableName: 'Coupon',
            Item: {
                id: id,
                title: params.title,
                description: params.description,
                goods: params.goods,
                endDate: params.endDate,
                issued: 0,
                limit: params.limit,
                imgs: params.imgs
            },
            ConditionExpression: "attribute_not_exists(id)" //항목 추가하기 전에 이미 존재하는 항목이 있을 경우 pk가 있을 때 조건 실패. pk는 반드시 있어야 하므로 replace를 방지
        };
        const run = () => __awaiter(this, void 0, void 0, function* () {
            yield this.Dynamodb.put(queryParams).promise();
            let result = {
                result: 'success',
                message: {
                    'id': id
                }
            };
            this.res.status(201).send(result);
        });
        try {
            run();
        }
        catch (err) { //DB에러 발생
            let result = {
                result: 'failed',
                error: err
            };
            this.res.status(400).send(result);
        }
    }
    /**
     * 쿠폰 조회 로직
     * 1. params.type에 읽을 방식 결정 coupon || campaign
     * 2. type에 따라 쿼리 파라메터 작성
     * 3. 쿼리 실행 후 결과 출력
     */
    read(params) {
        let type = params.type;
        let queryParams = {
            TableName: 'None',
            KeyConditionExpression: 'id = :id',
            ExpressionAttributeValues: { ':id': params.id, },
            ProjectionExpression: ''
        };
        switch (type) {
            case "coupon":
                queryParams.TableName = 'Coupon';
                delete (queryParams.ProjectionExpression);
                break;
            case "campaign":
                queryParams.TableName = 'Campaign';
                queryParams.ProjectionExpression = 'pinpoint';
                break;
            default:
                let result = {
                    result: 'failed',
                    error: 'Type Mismatch. Select Type between coupon and campaign'
                };
                this.res.status(400).send(result);
                return;
        }
        const run = () => __awaiter(this, void 0, void 0, function* () {
            let queryResult = yield this.Dynamodb.query(queryParams).promise();
            let result = {
                result: 'success',
                message: queryResult.Items
            };
            this.res.status(200).send(result);
        });
        try {
            run();
        }
        catch (err) {
            let result = {
                result: 'failed',
                error: 'DB Error. Please Contect Manager'
            };
            this.res.status(400).send(result);
        }
    }
    /**
     * 쿠폰 수정 로직
     * 1. 입력한 쿼리를 바탕으로 update parameter 생성
     * 2. 생성한 파라메터로 update 수행
     * 3. 결과 전송
    */
    update(params) {
        this.queryGen(params);
    }
    queryGen(params) {
        let queryArray = [];
        let updateExp = 'set ';
        let expAttrNames = undefined;
        if (params.description != undefined) {
            let query = 'description = :newdesc';
            queryArray.push(query);
        }
        if (params.goods != undefined) {
            let query = 'goods = :newgoods';
            queryArray.push(query);
        }
        if (params.endDate != undefined) {
            let query = 'enddate = :newend';
            queryArray.push(query);
        }
        if (params.limit != undefined) {
            let query = '#limit = :newlimit';
            expAttrNames = { '#id': 'id' };
            queryArray.push(query);
        }
        for (let i = 0; i < queryArray.length - 1; i++) {
            updateExp = updateExp + queryArray.pop() + ', ';
        }
        updateExp += queryArray.pop();
        console.log(updateExp);
    }
    delete(params) {
        throw new Error("Method not implemented.");
    }
}
exports.default = CouponManager;
