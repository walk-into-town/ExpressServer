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
class CampaignManager extends FeatureManager_1.FeatureManager {
    /**
     * 캠페인 생성 로직
     * 1. 제작자 + 이름 + 지역으로 id생성
     * 2. 사용자 id와 핀포인트 id, 쿠폰 id의 유효성 검사
     * 3. 유효하다면 isValid = true
     * 4. 유효할 때 캠페인 생성 아닐경우 error
     */
    insert(params) {
        let hash = CryptoJS.SHA256(params.ownner + params.name + params.region);
        let id = hash.toString(CryptoJS.enc.Base64);
        this.res.locals.id = id;
        params.pcoupons = [];
        const run = () => __awaiter(this, void 0, void 0, function* () {
            let isIdValid; //입력받은 사용자 id, 핀포인트 id가 존재하는지 검증
            let isPinpointValid;
            let isCouponValid;
            let result = {
                result: 'failed',
                error: []
            };
            if (params.coupon != undefined) {
                if (params.coupon != undefined) {
                    let checkCouponParams = {
                        TableName: 'Coupon',
                        KeyConditionExpression: 'id = :id',
                        ExpressionAttributeValues: {
                            ':id': params.coupon
                        }
                    };
                    console.log(`쿠폰 체크\nDB 요청 params\n${checkCouponParams}`);
                    yield this.Dynamodb.query(checkCouponParams, onCheckCoupon.bind(this)).promise();
                }
                function onCheckCoupon(err, data) {
                    if (isCouponValid == false) {
                        return;
                    }
                    if (err) {
                        isCouponValid = false;
                        result.error.push('DB Error. Please Contect Manager');
                        console.log('쿠폰 체크 DB 에러 발생');
                    }
                    else {
                        if (data.Items[0] == undefined) { //data.Item == undefined -> 해당하는 ID가 없음
                            isCouponValid = false;
                            result.error.push('Invalid Coupon');
                            console.log('일치하는 쿠폰 없음');
                            return;
                        }
                        isCouponValid = true;
                    }
                }
            }
            let checkIdParams = {
                TableName: 'Member',
                KeyConditionExpression: 'id = :id',
                ExpressionAttributeValues: {
                    ':id': params.ownner
                }
            };
            function onCheckId(err, data) {
                if (isIdValid == false) {
                    return;
                }
                if (err) { //DB오류
                    isIdValid = false;
                    result.error.push('DB Error. Please Contect Manager');
                    console.log('ID 체크 DB 에러 발생');
                    return;
                }
                else {
                    if (data.Items == undefined) { //data.Item == undefined -> 해당하는 ID가 없음
                        isIdValid = false;
                        result.error.push('Invalid User');
                        console.log('일치하는 사용자 없음');
                        return;
                    }
                    isIdValid = true;
                }
            }
            console.log(`사용자 체크\nDB 요청 params\n${JSON.stringify(checkIdParams, null, 2)}`);
            yield this.Dynamodb.query(checkIdParams, onCheckId.bind(this)).promise(); //id를 가져온 후 확인
            let pinpoints = [];
            params.pinpoints.forEach(pinpoint => {
                pinpoints.push({ 'id': pinpoint });
            });
            let checkPinpointParams = {
                RequestItems: {
                    'Pinpoint': {
                        Keys: pinpoints
                    }
                }
            };
            function onCheckPinoint(err, data) {
                data = data.Responses.Pinpoint;
                if (isPinpointValid == false) {
                    return;
                }
                if (err) { //DB에러
                    isPinpointValid = false;
                    result.error.push('DB Error. Please Contect Manager');
                    console.log('핀포인트 체크 DB 에러 발생');
                }
                else {
                    if (data == undefined) { //일치하는 핀포인트 ID가 하나도 없을 때
                        isPinpointValid = false;
                        result.error.push('Invalid Pinpoint');
                        console.log('일치하는 핀포인트 없음');
                        return;
                    }
                    if (data.length != pinpoints.length) { //DB가 준 핀포인트 수와 사용자 입력 핀포인트 수가 다름 = 잘못된 핀포인트 존재
                        isPinpointValid = false;
                        result.error.push('Invalid Pinpoint');
                        console.log('일부 핀포인트가 일치하지 않음');
                        return;
                    }
                    isPinpointValid = true;
                    data.forEach(pinpoint => {
                        if (pinpoint.coupon != undefined) {
                            params.pcoupons.push(pinpoint.coupon);
                        }
                    });
                }
            }
            console.log(`핀포인트 체크\nDB 요청 params\n${checkPinpointParams}`);
            yield this.Dynamodb.batchGet(checkPinpointParams, onCheckPinoint.bind(this)).promise();
            if (isIdValid == false || isPinpointValid == false || isCouponValid == false) { //사용자 ID와 핀포인트 ID를 체크해서 1개라도 틀린경우 
                this.res.status(400).send(result); //에러 메시지 전달
                console.log(`응답 jSON\n${JSON.stringify(result, null, 2)}`);
                return;
            }
            var queryParams = {
                TableName: 'Campaign',
                Item: {
                    id: id,
                    ownner: params.ownner,
                    imgs: params.imgs,
                    name: params.name,
                    description: params.description,
                    updateTime: params.updateTime,
                    region: params.region,
                    pinpoints: params.pinpoints,
                    coupons: params.coupons,
                    pcoupons: params.pcoupons
                },
                ConditionExpression: "attribute_not_exists(id)" //항목 추가하기 전에 이미 존재하는 항목이 있을 경우 pk가 있을 때 조건 실패. pk는 반드시 있어야 하므로 replace를 방지
            };
            console.log('캠페인 등록중...');
            this.Dynamodb.put(queryParams, this.onInsert.bind(this));
        });
        run();
    }
    onInsert(err, data) {
        if (err) { //에러 발생
            let result = {
                result: 'failed',
                error: err
            };
            this.res.status(400).send(result);
            console.log(`응답 JSON\n${JSON.stringify(result)}`);
        }
        else { //정상 처리
            let result = {
                "result": "success",
                "message": this.res.locals.id // DynamoDB에서는 insert시 결과 X. 따라서 임의로 생성되는 id를 전달하기 위해 locals에 id 추가
            };
            this.res.status(201).send(result);
            console.log(`응답 JSON\n${JSON.stringify(result)}`);
        }
    }
    /**
     * 캠페인 조회 로직
     * 1. readType에 따라 사용할 GSI를 선택한다.
     * 2. 선택한 GSI를 이용해 쿼리를 전달한다.
     * 3. 사용자에게 결과를 전달한다.
     */
    read(params, readType) {
        let index = null;
        let expAttrVals;
        switch (readType) { //Index를 선택하는 부분. 백틱을 사용할 수 없기 때문에
            case FeatureManager_1.toRead.name: //다음과 expAttrVals를 만듦
                index = 'nameIndex';
                expAttrVals = {
                    '#name': readType
                };
                break;
            case FeatureManager_1.toRead.id:
                expAttrVals = {
                    '#id': readType
                };
                break;
            case FeatureManager_1.toRead.ownner:
                index = 'ownnerIndex';
                expAttrVals = {
                    '#ownner': readType
                };
                break;
            case FeatureManager_1.toRead.region:
                index = 'regionIndex';
                expAttrVals = {
                    '#region': readType
                };
                break;
        }
        params = {
            TableName: 'Campaign',
            IndexName: index,
            KeyConditionExpression: `#${readType} = :value`,
            ExpressionAttributeNames: expAttrVals,
            ExpressionAttributeValues: { ':value': params },
        };
        this.Dynamodb.query(params, this.onRead.bind(this));
    }
    onRead(err, data) {
        if (err) { //에러 발생
            let result = {
                result: 'failed',
                error: err
            };
            this.res.status(400).send(result);
        }
        else {
            let result = {
                result: 'success',
                message: ''
            };
            if (data.Items[0] == undefined) {
                result.result = 'failed',
                    result.message = 'No Campaign found';
            }
            else {
                result.message = data.Items;
            }
            this.res.status(201).send(result);
        }
    }
    /**
     * 캠페인 수정 로직
     * 1. 사용자가 입력한 id를 이용해 캠페인 검색
     * 2. 송신 데이터 중 입력된 값만 변경
     * 3. 결과 전달
     */
    update(params) {
        let queryParams = {
            TableName: 'Campaign',
            KeyConditionExpression: 'id = :id',
            ExpressionAttributeValues: { ':id': params.id }
        };
        const run = () => __awaiter(this, void 0, void 0, function* () {
            const result = yield this.Dynamodb.query(queryParams).promise();
            let originCampaign = result.Items[0];
            if (originCampaign == undefined) { //일치하는 id 없음
                let result = {
                    result: 'failed',
                    error: 'Campaign id mismatch'
                };
                this.res.status(400).send(result);
                return;
            }
            let pinpoints = [];
            let coupons = [];
            params.pinpoints.forEach(pinpoint => {
                pinpoints.push({ "id": pinpoint });
            });
            params.coupons.forEach(coupon => {
                coupons.push({ "id": coupon });
            });
            let checkParams = {
                RequestItems: {
                    'Pinpoint': {
                        Keys: pinpoints
                    },
                    'Coupon': {
                        Keys: coupons
                    }
                }
            };
            const check = yield this.Dynamodb.batchGet(checkParams).promise();
            let pinpointCheck = check.Responses.Pinpoint.length;
            let couponCheck = check.Responses.Coupon.length;
            if (pinpointCheck != pinpoints.length || couponCheck != coupons.length) {
                let result = {
                    result: 'failed',
                    error: 'One or more Pinpots or Coupons id are invalid'
                };
                this.res.status(400).send(result);
                return;
            }
        });
        try {
            run();
        }
        catch (error) { //DB 에러 발생
            let result = {
                result: 'failed',
                error: 'DB Error. Please Contect Manager',
                error2: error
            };
            this.res.status(400).send(result);
        }
    }
    delete(params) {
    }
}
exports.default = CampaignManager;
