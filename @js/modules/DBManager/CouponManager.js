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
const nbsp_1 = require("../Logics/nbsp");
class CouponManager extends FeatureManager_1.FeatureManager {
    /**
     * 쿠폰 등록 로직
     * 1. 상품의 수와 발급 제한 개수가 동일한지 확인
     * 2. 현재 시각을 이용해 id 생성
     * 3. DB에 추가
     * 4. 쿼리 결과에 따라 사용자에게 응답
     */
    insert(params) {
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
                img: params.img,
                paymentCondition: params.paymentCondition
            },
            ConditionExpression: "attribute_not_exists(id)" //항목 추가하기 전에 이미 존재하는 항목이 있을 경우 pk가 있을 때 조건 실패. pk는 반드시 있어야 하므로 replace를 방지
        };
        const run = () => __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.Dynamodb.put(queryParams).promise();
                this.res.locals.coupons.push(queryParams.Item);
                // let result = {
                //     result: 'success',
                //     message: {
                //         'id': id
                //     }
                // }
                // this.res.status(201).send(result)
            }
            catch (err) { //DB에러 발생
                result_1.fail.error = result_1.error.dbError;
                result_1.fail.errdesc = err;
                this.res.status(521).send(result_1.fail);
            }
        });
        run();
    }
    /**
     * 쿠폰 조회 로직
     * 1. params.type에 읽을 방식 결정 coupon || campaign
     * 2. type에 따라 쿼리 파라메터 작성
     * 3. 쿼리 실행 후 결과 출력
     */
    read(params) {
        params.value = nbsp_1.nbsp2plus(params.value);
        let queryParams = {
            TableName: 'Coupon',
            KeyConditionExpression: 'id = :id',
            ExpressionAttributeValues: { ':id': params.value, }
        };
        const run = () => __awaiter(this, void 0, void 0, function* () {
            try {
                let queryResult = yield this.Dynamodb.query(queryParams).promise();
                result_1.success.data = queryResult.Items;
                this.res.status(200).send(result_1.success);
            }
            catch (err) {
                result_1.fail.error = result_1.error.dbError;
                result_1.fail.errdesc = err;
                this.res.status(521).send(result_1.fail);
            }
        });
        run();
    }
    readList(params) {
        params.value = nbsp_1.nbsp2plus(params.value);
        let checkParams = {
            TableName: '',
            KeyConditionExpression: 'id = :id',
            ExpressionAttributeValues: { ':id': params.value },
            ProjectionExpression: 'coupons, pcoupons'
        };
        if (params.type == 'campaign') {
            checkParams.TableName = 'Campaign';
        }
        else if (params.type == 'pinpoint') {
            checkParams.TableName = 'Pinpoint';
        }
        const run = () => __awaiter(this, void 0, void 0, function* () {
            try {
                let result = yield this.Dynamodb.query(checkParams).promise();
                let couponParams = {
                    RequestItems: {
                        'Coupon': {
                            Keys: null
                        }
                    }
                };
                if (params.type == 'campaign') {
                    let coupon = result.Items[0].coupons;
                    let pcoupons = result.Items[0].pcoupons;
                    let couponList = [];
                    if (coupon.length == 0 && pcoupons.length == 0) {
                        result_1.success.data = [];
                        this.res.status(200).send(result_1.success);
                        return;
                    }
                    for (const id of coupon) {
                        pcoupons.push(id);
                    }
                    pcoupons.forEach(coupon => {
                        let obj = {
                            id: coupon
                        };
                        couponList.push(obj);
                    });
                    console.log(couponList);
                    couponParams.RequestItems.Coupon.Keys = couponList;
                }
                else {
                    let coupon = result.Items[0].coupons;
                    let couponList = [];
                    if (coupon.length == 0) {
                        result_1.success.data = [];
                        this.res.status(200).send(result_1.success);
                        return;
                    }
                    for (const id of coupon) {
                        let obj = {
                            id: id
                        };
                        couponList.push(obj);
                    }
                    console.log(couponList);
                    couponParams.RequestItems.Coupon.Keys = couponList;
                }
                let queryResult = yield this.Dynamodb.batchGet(couponParams).promise();
                let coupons = queryResult.Responses.Coupon;
                for (const coupon of coupons) {
                    delete coupon.paymentCondition;
                }
                result_1.success.data = coupons;
                this.res.status(200).send(result_1.success);
            }
            catch (err) {
                result_1.fail.error = result_1.error.dbError;
                result_1.fail.errdesc = err;
                this.res.status(521).send(result_1.fail);
            }
        });
        run();
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
    /**
     * 쿠폰 삭제 로직
     * 1. id 입력 받기
     * 2. db 삭제 요청
     * 3. 결과에 따라 값 반환
     */
    delete(params) {
        console.log(params);
        var queryParams = {
            TableName: 'Coupon',
            Key: {
                'id': params.id
            },
            ReturnValues: 'ALL_OLD'
        };
        const run = () => __awaiter(this, void 0, void 0, function* () {
            try {
                let dbResult = yield this.Dynamodb.delete(queryParams).promise();
                if (dbResult.Attributes == undefined) {
                    result_1.success.data = [];
                }
                else {
                    result_1.success.data = dbResult.Attributes;
                }
                this.res.status(200).send(result_1.success);
            }
            catch (err) {
                result_1.fail.error = result_1.error.dbError;
                result_1.fail.errdesc = err;
                this.res.status(521).send(result_1.fail);
            }
        });
        run();
    }
    useCoupon(params) {
        let id = this.req.session.passport.user.id;
        let queryParams = {
            TableName: 'Member',
            KeyConditionExpression: 'id = :id',
            ProjectionExpression: 'coupons',
            ExpressionAttributeValues: { ':id': id }
        };
        let updateParams = {
            TableName: 'Member',
            Key: { 'id': id },
            UpdateExpression: 'set coupons = :newcoupons',
            ExpressionAttributeValues: { ':newcoupons': null }
        };
        const run = () => __awaiter(this, void 0, void 0, function* () {
            let result = yield this.Dynamodb.query(queryParams).promise();
            let coupons = result.Items[0].coupons;
            if (coupons.length == 0) {
                result_1.fail.error = result_1.error.invalReq;
                result_1.fail.errdesc = '사용 가능한 쿠폰이 없습니다.';
                this.res.status(400).send(result_1.fail);
                return;
            }
            for (const coupon of coupons) {
                if (coupon.id == params.cid && coupon.used == false) {
                    coupon.used = true;
                    result_1.success.data = '쿠폰 사용 성공';
                    updateParams.ExpressionAttributeValues[":newcoupons"] = coupons;
                    yield this.Dynamodb.update(updateParams).promise();
                    this.res.status(201).send(result_1.success);
                    return;
                }
            }
            result_1.fail.error = result_1.error.invalReq;
            result_1.fail.errdesc = '이미 사용하거나 없는 쿠폰입니다.';
            this.res.status(400).send(result_1.fail);
        });
        run();
    }
}
exports.default = CouponManager;
