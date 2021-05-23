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
class CampaignManager extends FeatureManager_1.FeatureManager {
    /**
     * 캠페인 생성 로직
     * 1. 제작자 + 이름 + 지역으로 id생성
     * 2. 사용자 id와 핀포인트 id, 쿠폰 id의 유효성 검사
     * 3. 유효하다면 isValid = true
     * 4. 유효할 때 캠페인 생성 아닐경우 error
     */
    insert(params) {
        let date = new Date();
        console.log(date.toString());
        let hash = CryptoJS.SHA256(params.ownner + params.name + params.region + date.toString());
        let id = hash.toString(CryptoJS.enc.Base64);
        this.res.locals.id = id;
        const run = () => __awaiter(this, void 0, void 0, function* () {
            try {
                let isIdValid; //입력받은 사용자 id, 핀포인트 id가 존재하는지 검증
                let isPinpointValid;
                let isCouponValid;
                if (params.coupon != undefined) {
                    if (params.coupon != undefined) {
                        let checkCouponParams = {
                            TableName: 'Coupon',
                            KeyConditionExpression: 'id = :id',
                            ExpressionAttributeValues: {
                                ':id': params.coupon
                            }
                        };
                        console.log(`쿠폰 체크\nDB 요청 params\n${JSON.stringify(checkCouponParams, null, 2)}`);
                        yield this.Dynamodb.query(checkCouponParams, onCheckCoupon.bind(this)).promise();
                    }
                    function onCheckCoupon(err, data) {
                        if (isCouponValid == false) {
                            return;
                        }
                        if (err) {
                            isCouponValid = false;
                            result_1.fail.error = result_1.error.dbError;
                            result_1.fail.errdesc = err;
                            console.log('쿠폰 체크 DB 에러 발생');
                        }
                        else {
                            if (data.Items[0] == undefined) { //data.Item == undefined -> 해당하는 ID가 없음
                                isCouponValid = false;
                                result_1.fail.error = result_1.error.dataNotFound;
                                result_1.fail.errdesc = '일치하는 쿠폰 없음';
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
                        result_1.fail.error = result_1.error.dbError;
                        result_1.fail.errdesc = err;
                        console.log('ID 체크 DB 에러 발생');
                        return;
                    }
                    else {
                        if (data.Items == undefined) { //data.Item == undefined -> 해당하는 ID가 없음
                            isIdValid = false;
                            result_1.fail.error = result_1.error.dataNotFound;
                            result_1.fail.errdesc = '일치하는 사용자 없음';
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
                        result_1.fail.error = result_1.error.dbError;
                        result_1.fail.errdesc = err;
                        console.log('핀포인트 체크 DB 에러 발생');
                    }
                    else {
                        if (data == undefined) { //일치하는 핀포인트 ID가 하나도 없을 때
                            isPinpointValid = false;
                            result_1.fail.error = result_1.error.dataNotFound;
                            result_1.fail.errdesc = '일치하는 핀포인트 없음';
                            console.log('일치하는 핀포인트 없음');
                            return;
                        }
                        if (data.length != pinpoints.length) { //DB가 준 핀포인트 수와 사용자 입력 핀포인트 수가 다름 = 잘못된 핀포인트 존재
                            isPinpointValid = false;
                            result_1.fail.error = result_1.error.dataNotFound;
                            result_1.fail.errdesc = '핀포인트 일치하지 않음';
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
                console.log(`핀포인트 체크\nDB 요청 params\n${JSON.stringify(checkPinpointParams, null, 2)}`);
                yield this.Dynamodb.batchGet(checkPinpointParams, onCheckPinoint.bind(this)).promise();
                if (isIdValid == false || isPinpointValid == false || isCouponValid == false) { //사용자 ID와 핀포인트 ID를 체크해서 1개라도 틀린경우 
                    this.res.status(400).send(result_1.fail); //에러 메시지 전달
                    console.log(`응답 jSON\n${JSON.stringify(result_1.fail, null, 2)}`);
                    return;
                }
                let date = new Date();
                params.updateTime = date.toISOString();
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
                        coupons: [params.coupons],
                        pcoupons: params.pcoupons,
                        comments: [],
                        users: []
                    },
                    ConditionExpression: "attribute_not_exists(id)" //항목 추가하기 전에 이미 존재하는 항목이 있을 경우 pk가 있을 때 조건 실패. pk는 반드시 있어야 하므로 replace를 방지
                };
                console.log(`캠페인 등록 DB 요청 params\n${JSON.stringify(queryParams, null, 2)}`);
                this.res.locals.campid = id;
                yield this.Dynamodb.put(queryParams).promise();
                let MemberParams = {
                    TableName: 'Member',
                    Key: { id: params.ownner },
                    UpdateExpression: 'set myCampaigns = list_append(if_not_exists(myCampaigns, :emptylist), :newCampaign)',
                    ExpressionAttributeValues: { ':newCampaign': [id], ':emptylist': [] },
                    ReturnValues: 'UPDATED_NEW',
                    ConditionExpression: "attribute_exists(id)"
                };
                console.log('제작 캠페인 업데이트중...');
                yield this.Dynamodb.update(MemberParams).promise();
                result_1.success.data = id;
                console.log('제작 캠페인 업데이트 완료');
                console.log(`응답 JSON\n${JSON.stringify(result_1.success, null, 2)}`);
                this.res.status(201).send(result_1.success);
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
                let campParam = {
                    TableName: 'Campaign',
                    Key: {
                        'id': this.res.locals.campid
                    }
                };
                yield this.Dynamodb.delete(campParam).promise();
                result_1.fail.error = result_1.error.invalReq;
                result_1.fail.errdesc = err;
                this.res.status(521).send(result_1.fail);
            }
        });
        run();
    }
    // private onInsert(err: object, data: any){
    //     if(err){                                    //에러 발생
    //         fail.error = error.dbError
    //         fail.errdesc = err
    //         this.res.status(400).send(fail)
    //         console.log(`DB에러\n응답 JSON\n${JSON.stringify(fail, null, 2)}`)
    //     }
    //     else{                                      //정상 처리
    //         success.data = this.res.locals.id
    //         this.res.status(201).send(success)
    //         console.log(`캠페인 등록 성공\n응답 JSON\n${JSON.stringify(success, null, 2)}`)
    //     }
    // }
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
                params = nbsp_1.nbsp2plus(params);
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
        console.log(`DB 요청 params\n${JSON.stringify(params, null, 2)}`);
        this.Dynamodb.query(params, this.onRead.bind(this));
    }
    readPart(params, readType) {
        let criterion = readType;
        let value = params;
        const quickSort = require('../Logics/Sorter');
        const run = (criterion, value) => __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('DB 요청 params 설정중');
                let FilterExp;
                let ExpAttrNames;
                switch (criterion) {
                    case 'name':
                        FilterExp = `contains(#${criterion}, :value)`;
                        ExpAttrNames = { '#name': 'name' };
                        break;
                    case 'ownner':
                        FilterExp = `contains(#${criterion}, :value)`;
                        ExpAttrNames = { '#ownner': 'ownner' };
                        break;
                    case 'region':
                        FilterExp = `contains(#${criterion}, :value)`;
                        ExpAttrNames = { '#region': 'region' };
                        break;
                    default:
                        break;
                }
                let queryParams = {
                    TableName: 'Campaign',
                    FilterExpression: FilterExp,
                    ExpressionAttributeNames: ExpAttrNames,
                    ExpressionAttributeValues: { ':value': value }
                };
                console.log(`DB 요청 params 설정 완료. 설정 JSON${JSON.stringify(queryParams, null, 2)}`);
                console.log('캠페인 스캔중');
                let result = yield this.Dynamodb.scan(queryParams).promise();
                console.log(`캠페인 스캔 완료. 결과 JSON${JSON.stringify(result, null, 2)}`);
                if (result.Items.length == 1) {
                    result_1.success.data = result.Items;
                    console.log(`응답 JSON\n${JSON.stringify(result_1.success, null, 2)}`);
                    this.res.status(200).send(result_1.success);
                    return;
                }
                if (result.Items.length == 0) {
                    result_1.success.data = [];
                    console.log(`응답 JSON\n${JSON.stringify(result_1.success, null, 2)}`);
                    this.res.status(200).send(result_1.success);
                    return;
                }
                let toSort = [];
                let primearr = [];
                for (const object of result.Items) {
                    if (object.name.startsWith(value)) {
                        primearr.push(object);
                    }
                    else {
                        toSort.push(object);
                    }
                }
                console.log('정렬 시작');
                toSort = yield quickSort(toSort);
                primearr = yield quickSort(primearr);
                primearr.push(...toSort);
                console.log(`정렬 완료. 정렬된 배열\n${JSON.stringify(primearr, null, 2)}`);
                result_1.success.data = primearr;
                console.log(`응답 JSON\n${JSON.stringify(result_1.success, null, 2)}`);
                this.res.status(200).send(result_1.success);
            }
            catch (err) {
                result_1.fail.error = result_1.error.dbError;
                result_1.fail.errdesc = err;
                this.res.status(521).send(result_1.fail);
            }
        });
        run(criterion, value);
    }
    scan() {
        let queryParams = {
            TableName: 'Campaign'
        };
        const run = () => __awaiter(this, void 0, void 0, function* () {
            console.log('캠페인 전체 조회 시작');
            try {
                let queryResult = yield this.Dynamodb.scan(queryParams).promise();
                result_1.success.data = queryResult.Items;
                console.log(`조회 성공. 응답 JSON\n${JSON.stringify(result_1.success, null, 2)}`);
                this.res.status(200).send(result_1.success);
            }
            catch (err) {
                result_1.fail.error = result_1.error.dbError;
                result_1.fail.errdesc = err;
                console.log(`조회 실패. 응답 JSON\n${JSON.stringify(result_1.fail, null, 2)}`);
                this.res.status(521).send(result_1.fail);
            }
        });
        run();
    }
    onRead(err, data) {
        if (err) { //에러 발생
            result_1.fail.error = result_1.error.dbError;
            result_1.fail.errdesc = err;
            console.log(`조회 실패. 응답 JSON\n${JSON.stringify(result_1.fail, null, 2)}`);
            this.res.status(521).send(result_1.fail);
        }
        else {
            if (data.Items[0] == undefined) {
                result_1.success.data = [];
            }
            else {
                result_1.success.data = data.Items;
            }
            console.log(`조회 성공. 응답 JSON\n${JSON.stringify(result_1.success, null, 2)}`);
            this.res.status(200).send(result_1.success);
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
            ExpressionAttributeValues: { ':id': params.cid }
        };
        const run = () => __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.Dynamodb.query(queryParams).promise();
                let originCampaign = result.Items[0];
                if (originCampaign == undefined) { //일치하는 id 없음
                    result_1.fail.error = result_1.error.dataNotFound;
                    result_1.fail.errdesc = '일치하는 캠페인 id 없음';
                    this.res.status(400).send(result_1.fail);
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
                    result_1.fail.error = result_1.error.dataNotFound;
                    result_1.fail.errdesc = '일치하는 핀포인트 또는 쿠폰 id 없음';
                    this.res.status(400).send(result_1.fail);
                    return;
                }
            }
            catch (err) { //DB 에러 발생
                result_1.fail.error = result_1.error.dbError;
                result_1.fail.errdesc = err;
                this.res.status(521).send(result_1.fail);
            }
        });
        run();
    }
    delete(params) {
    }
    participate(params) {
        if (this.req.session.passport.user.id != params.uid) { //세션 탈취 방지
            result_1.fail.error = result_1.error.invalAcc;
            result_1.fail.errdesc = '잘못된 사용자 iD';
            this.res.status(400).send(result_1.fail);
            return;
        }
        let userId = params.uid;
        let cId = params.caid;
        let campaigncheck = {
            TableName: 'Campaign',
            KeyConditionExpression: 'id = :id',
            ExpressionAttributeValues: { ':id': cId }
        };
        let myCampCheck = {
            TableName: 'Member',
            KeyConditionExpression: 'id = :id',
            ProjectionExpression: 'myCampaigns, playingCampaigns',
            ExpressionAttributeValues: { ':id': userId }
        };
        let playingCamp = [];
        let updateParams = {
            TableName: 'Member',
            Key: { id: userId },
            UpdateExpression: 'set playingCampaigns = list_append(if_not_exists(myCampaigns, :emptylist), :newCampaign)',
            ExpressionAttributeValues: { ':newCampaign': null, ':emptylist': [] },
            ReturnValues: 'UPDATED_NEW',
            ConditionExpression: "attribute_exists(id)"
        };
        let campUpdateParams = {
            TableName: 'Campaign',
            Key: { id: params.caid },
            UpdateExpression: 'set #users = list_append(if_not_exists(#users, :emptylist), :newUser)',
            ExpressionAttributeValues: { ':newUser': null, ':emptylist': [] },
            ExpressionAttributeNames: { '#users': 'users' },
            ReturnValues: 'UPDATED_NEW',
            ConditionExpression: 'attribute_exists(id)'
        };
        const run = () => __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('캠페인 존재 여부 확인중...');
                let campCheckResult = yield this.Dynamodb.query(campaigncheck).promise();
                if (campCheckResult.Items[0] == undefined) {
                    result_1.fail.error = result_1.error.invalKey;
                    result_1.fail.errdesc = '잘못된 캠페인 id';
                    this.res.status(400).send(result_1.fail);
                    return;
                }
                console.log('캠페인 존재 여부 통과');
                let MycheckResult = yield this.Dynamodb.query(myCampCheck).promise();
                let myCampaigns = MycheckResult.Items[0].myCampaigns;
                let playingCampaigns = MycheckResult.Items[0].playingCampaigns;
                console.log('캠페인 검사 시작');
                console.log('본인 제작 여부 확인중...');
                for (let i = 0; i < myCampaigns.length; i++) {
                    if (myCampaigns[i] == cId) {
                        result_1.fail.error = result_1.error.invalReq;
                        result_1.fail.errdesc = '본인이 제작한 캠페인은 참여하실 수 없습니다.';
                        this.res.status(400).send(result_1.fail);
                        return;
                    }
                }
                console.log('본인 제작 여부 통과');
                console.log('참여중 여부 확인중...');
                for (let i = 0; i < playingCampaigns.length; i++) {
                    if (playingCampaigns[i].id == cId) {
                        result_1.fail.error = result_1.error.invalReq;
                        result_1.fail.errdesc = '참여 중이거나 이미 참여한 캠페인입니다.';
                        this.res.status(400).send(result_1.fail);
                        return;
                    }
                }
                console.log('참여중 여부 통과');
                console.log('캠페인 검사 통과');
                console.log('DB 반영 시작');
                let pinpoint2add = [];
                for (const id of campCheckResult.Items[0].pinpoints) {
                    let obj = {
                        'id': id,
                        cleared: false
                    };
                    pinpoint2add.push(obj);
                }
                let camp2add = {
                    id: cId,
                    cleared: false,
                    pinpoints: pinpoint2add
                };
                playingCamp.push(camp2add);
                updateParams.ExpressionAttributeValues[":newCampaign"] = playingCamp;
                console.log(updateParams);
                let partiResult = yield this.Dynamodb.update(updateParams).promise();
                campUpdateParams.ExpressionAttributeValues[":newUser"] = [params.uid];
                let updatecamp = yield this.Dynamodb.update(campUpdateParams).promise();
                result_1.success.data = partiResult.Attributes;
                console.log(`DB 반영 완료.\n응답 JSOn\n${JSON.stringify(result_1.success.data, null, 2)}`);
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
    insertrReview(params) {
        let userid = this.req.session.passport.user.id;
        let date = new Date();
        let hash = CryptoJS.SHA256(params.caid + date.toString()); //id 생성
        params.rid = hash.toString(CryptoJS.enc.Base64);
        if (userid != params.comments.userId) { //세션의 id와 전송한 id가 다른 경우
            result_1.fail.error = result_1.error.invalKey;
            result_1.fail.errdesc = '세션 정보와 id가 일치하지 않습니다.';
            this.res.status(400).send(result_1.fail);
            return;
        }
        if (params.rated > 5 || params.rated < 0) {
            result_1.fail.error = result_1.error.invalReq;
            result_1.fail.errdesc = '평점은 5점 이하, 0점 이상이어야 합니다.';
            this.res.status(400).send(result_1.fail);
            return;
        }
        let memberParams = {
            TableName: 'Member',
            KeyConditionExpression: 'id = :id',
            ExpressionAttributeValues: { ':id': userid },
            ProjectionExpression: 'profileImg, nickname'
        };
        let campaignParams = {
            TableName: 'Campaign',
            KeyConditionExpression: 'id = :id',
            ExpressionAttributeValues: { ':id': params.caid },
            ProjectionExpression: 'comments'
        };
        let comment = [{
                id: params.rid,
                userId: userid,
                text: params.comments.text,
                rated: Number(params.rated),
                imgs: params.imgs,
                nickname: null,
                profileImg: null,
                updateTime: date.toISOString()
            }];
        let queryParams = {
            TableName: 'Campaign',
            Key: { id: params.caid },
            UpdateExpression: 'set comments = list_append(if_not_exists(comments, :emptylist), :newcomment)',
            ExpressionAttributeValues: { ':newcomment': comment, ':emptylist': [] },
            ReturnValues: 'UPDATED_NEW',
            ConditionExpression: "attribute_exists(id)"
        };
        const run = () => __awaiter(this, void 0, void 0, function* () {
            try {
                let campaignResult = yield this.Dynamodb.query(campaignParams).promise();
                let comments = campaignResult.Items[0].comments;
                for (const comm of comments) {
                    if (comm.userId == userid) {
                        result_1.fail.error = result_1.error.invalReq;
                        result_1.fail.errdesc = '이미 리뷰를 등록한 캠페인 입니다.';
                        this.res.status(400).send(result_1.fail);
                        return;
                    }
                }
                let userResult = yield this.Dynamodb.query(memberParams).promise();
                let user = userResult.Items[0];
                comment[0].nickname = user.nickname;
                comment[0].profileImg = user.profileImg;
                console.log(comment[0]);
                let queryResult = yield this.Dynamodb.update(queryParams).promise();
                result_1.success.data = comment[0];
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
    readReview(params) {
        if (params.caid == undefined) {
            result_1.fail.error = result_1.error.invalReq;
            result_1.fail.errdesc = '요청의 id값이 없습니다.';
            this.res.status(400).send(result_1.fail);
            return;
        }
        params.caid = nbsp_1.nbsp2plus(params.caid);
        let queryParams = {
            TableName: 'Campaign',
            KeyConditionExpression: 'id = :id',
            ProjectionExpression: 'comments',
            ExpressionAttributeValues: { ':id': params.caid }
        };
        const run = () => __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('리뷰 검색중');
                let result = yield this.Dynamodb.query(queryParams).promise();
                console.log(`조회 결과\n${JSON.stringify(result.Items, null, 2)}`);
                result_1.success.data = result.Items[0].comments;
                this.res.status(200).send(result_1.success);
            }
            catch (err) {
                result_1.fail.error = result_1.error.dbError;
                result_1.fail.errdesc = err;
                this.res.status(521).send(result_1.fail);
                return;
            }
        });
        run();
    }
    updateReview(params) {
        let userid = this.req.session.passport.user.id;
        if (params.text == undefined && params.rated == undefined) {
            result_1.fail.error = result_1.error.invalReq;
            result_1.fail.errdesc = '평점 또는 리뷰 내용을 보내주세요.';
            this.res.status(400).send(result_1.fail);
            return;
        }
        if (userid != params.uid) { //세션의 id와 전송한 id가 다른 경우
            result_1.fail.error = result_1.error.invalKey;
            result_1.fail.errdesc = '세션 정보와 id가 일치하지 않습니다.';
            this.res.status(400).send(result_1.fail);
            return;
        }
        if (params.rated > 5 || params.rated < 0) {
            result_1.fail.error = result_1.error.invalReq;
            result_1.fail.errdesc = '평점은 5점 이하, 0점 이상이어야 합니다.';
            this.res.status(400).send(result_1.fail);
            return;
        }
        let id = params.caid;
        let findParams = {
            TableName: 'Campaign',
            KeyConditionExpression: 'id = :id',
            ProjectionExpression: 'comments',
            ExpressionAttributeValues: { ':id': id }
        };
        let updateParams = {
            TableName: 'Campaign',
            Key: { id: params.caid },
            UpdateExpression: 'set comments = :newcomment',
            ExpressionAttributeValues: { ':newcomment': null },
            ReturnValues: 'UPDATED_NEW',
            ConditionExpression: "attribute_exists(id)"
        };
        const run = () => __awaiter(this, void 0, void 0, function* () {
            try {
                let id = this.req.session.passport.user.id;
                if (params.uid != id) {
                    result_1.fail.error = result_1.error.invalAcc;
                    result_1.fail.errdesc = "세션 정보와 id가 일치하지 않습니다.";
                    this.res.status(400).send(result_1.fail);
                    return;
                }
                let comments = yield this.Dynamodb.query(findParams).promise();
                if (comments.Items[0] == undefined) {
                    result_1.fail.error = result_1.error.dataNotFound;
                    result_1.fail.errdesc = "캠페인을 찾을 수 없습니다.";
                    this.res.status(400).send(result_1.fail);
                    return;
                }
                console.log('댓글 찾는중...');
                for (let i = 0; i < comments.Items[0].comments.length; i++) {
                    let rid = comments.Items[0].comments[i].id;
                    let uid = comments.Items[0].comments[i].userId;
                    if (rid == params.rid && uid == params.uid) {
                        console.log('조건 만족');
                        if (params.text == undefined) {
                            comments.Items[0].comments[i].rated = params.rated;
                            comments.Items[0].comments[i].time = new Date().toISOString();
                            comments.Items[0].comments[i].imgs = params.imgs;
                            result_1.success.data = comments.Items[0].comments[i];
                        }
                        else if (params.rated == undefined) {
                            comments.Items[0].comments[i].text = params.text;
                            comments.Items[0].comments[i].time = new Date().toISOString();
                            comments.Items[0].comments[i].imgs = params.imgs;
                            result_1.success.data = comments.Items[0].comments[i];
                        }
                        else {
                            comments.Items[0].comments[i].rated = params.rated;
                            comments.Items[0].comments[i].text = params.text;
                            comments.Items[0].comments[i].time = new Date().toISOString();
                            comments.Items[0].comments[i].imgs = params.imgs;
                            result_1.success.data = comments.Items[0].comments[i];
                        }
                        break;
                    }
                    if (i == comments.Items[0].comments.length - 1) {
                        result_1.fail.error = result_1.error.dataNotFound;
                        result_1.fail.errdesc = "리뷰를 찾을 수 없습니다.";
                        this.res.status(400).send(result_1.fail);
                        return;
                    }
                }
                console.log(comments.Items[0].comments);
                updateParams.ExpressionAttributeValues[":newcomment"] = comments.Items[0].comments;
                console.log('댓글 수정중...');
                let updateResult = yield this.Dynamodb.update(updateParams).promise();
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
    deleteReview(params) {
        let uid = this.req.session.passport.user.id;
        if (uid != params.uid) {
            result_1.fail.error = result_1.error.invalAcc;
            result_1.fail.errdesc = "세션정보와 id가 일치하지 않습니다.";
            this.res.status(400).send(result_1.fail);
            return;
        }
        let id = params.caid;
        let findParams = {
            TableName: 'Campaign',
            KeyConditionExpression: 'id = :id',
            ProjectionExpression: 'comments',
            ExpressionAttributeValues: { ':id': id }
        };
        let updateParams = {
            TableName: 'Campaign',
            Key: { id: params.caid },
            UpdateExpression: 'set comments = :newcomment',
            ExpressionAttributeValues: { ':newcomment': null },
            ReturnValues: 'UPDATED_NEW',
            ConditionExpression: "attribute_exists(id)"
        };
        const run = () => __awaiter(this, void 0, void 0, function* () {
            try {
                let comments = yield this.Dynamodb.query(findParams).promise();
                if (comments.Items[0] == undefined) {
                    result_1.fail.error = result_1.error.dataNotFound;
                    result_1.fail.errdesc = "핀포인트를 찾을 수 없습니다.";
                    this.res.status(400).send(result_1.fail);
                    return;
                }
                for (let i = 0; i < comments.Items[0].comments.length; i++) {
                    let rid = comments.Items[0].comments[i].id;
                    let uid = comments.Items[0].comments[i].userId;
                    if (rid == params.rid && uid == params.uid) {
                        comments.Items[0].comments.splice(i, 1);
                        break;
                    }
                    if (i == comments.Items[0].comments.length - 1) {
                        result_1.fail.error = result_1.error.invalKey;
                        result_1.fail.errdesc = '리뷰를 찾을 수 없습니다.';
                        this.res.status(400).send(result_1.fail);
                        return;
                    }
                }
                console.log('댓글 찾는중...');
                console.log(comments.Items[0].comments);
                updateParams.ExpressionAttributeValues[":newcomment"] = comments.Items[0].comments;
                let updateResult = yield this.Dynamodb.update(updateParams).promise();
                result_1.success.data = updateResult.Attributes.comments;
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
}
exports.default = CampaignManager;
