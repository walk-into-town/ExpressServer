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
const Sorter_1 = require("../Logics/Sorter");
const responseInit_1 = require("../Logics/responseInit");
const recommender_1 = require("../Logics/recommender");
class CampaignManager extends FeatureManager_1.FeatureManager {
    /**
     * ????????? ?????? ??????
     * 1. ????????? + ?????? + ???????????? id??????
     * 2. ????????? id??? ???????????? id, ?????? id??? ????????? ??????
     * 3. ??????????????? isValid = true
     * 4. ????????? ??? ????????? ?????? ???????????? error
     */
    insert(params) {
        let date = new Date(Date.now() + 9 * 60 * 60 * 1000);
        console.log(date.toString());
        let hash = CryptoJS.SHA256(params.ownner + params.name + params.region + date.toString());
        let id = hash.toString(CryptoJS.enc.Base64);
        this.res.locals.id = id;
        const run = () => __awaiter(this, void 0, void 0, function* () {
            try {
                let isIdValid; //???????????? ????????? id, ???????????? id??? ??????????????? ??????
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
                        console.log(`?????? ??????\nDB ?????? params\n${JSON.stringify(checkCouponParams, null, 2)}`);
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
                            console.log('?????? ?????? DB ?????? ??????');
                        }
                        else {
                            if (data.Items[0] == undefined) { //data.Item == undefined -> ???????????? ID??? ??????
                                isCouponValid = false;
                                result_1.fail.error = result_1.error.dataNotFound;
                                result_1.fail.errdesc = '???????????? ?????? ??????';
                                console.log('???????????? ?????? ??????');
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
                    if (err) { //DB??????
                        isIdValid = false;
                        result_1.fail.error = result_1.error.dbError;
                        result_1.fail.errdesc = err;
                        console.log('ID ?????? DB ?????? ??????');
                        return;
                    }
                    else {
                        if (data.Items == undefined) { //data.Item == undefined -> ???????????? ID??? ??????
                            isIdValid = false;
                            result_1.fail.error = result_1.error.dataNotFound;
                            result_1.fail.errdesc = '???????????? ????????? ??????';
                            console.log('???????????? ????????? ??????');
                            return;
                        }
                        isIdValid = true;
                    }
                }
                console.log(`????????? ??????\nDB ?????? params\n${JSON.stringify(checkIdParams, null, 2)}`);
                yield this.Dynamodb.query(checkIdParams, onCheckId.bind(this)).promise(); //id??? ????????? ??? ??????
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
                    if (err) { //DB??????
                        isPinpointValid = false;
                        result_1.fail.error = result_1.error.dbError;
                        result_1.fail.errdesc = err;
                        console.log('???????????? ?????? DB ?????? ??????');
                    }
                    else {
                        if (data == undefined) { //???????????? ???????????? ID??? ????????? ?????? ???
                            isPinpointValid = false;
                            result_1.fail.error = result_1.error.dataNotFound;
                            result_1.fail.errdesc = '???????????? ???????????? ??????';
                            console.log('???????????? ???????????? ??????');
                            return;
                        }
                        if (data.length != pinpoints.length) { //DB??? ??? ???????????? ?????? ????????? ?????? ???????????? ?????? ?????? = ????????? ???????????? ??????
                            isPinpointValid = false;
                            result_1.fail.error = result_1.error.dataNotFound;
                            result_1.fail.errdesc = '???????????? ???????????? ??????';
                            console.log('?????? ??????????????? ???????????? ??????');
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
                console.log(`???????????? ??????\nDB ?????? params\n${JSON.stringify(checkPinpointParams, null, 2)}`);
                yield this.Dynamodb.batchGet(checkPinpointParams, onCheckPinoint.bind(this)).promise();
                if (isIdValid == false || isPinpointValid == false || isCouponValid == false) { //????????? ID??? ???????????? ID??? ???????????? 1????????? ???????????? 
                    this.res.status(400).send(result_1.fail); //?????? ????????? ??????
                    console.log(`?????? jSON\n${JSON.stringify(result_1.fail, null, 2)}`);
                    return;
                }
                let date = new Date(Date.now() + 9 * 60 * 60 * 1000);
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
                    ConditionExpression: "attribute_not_exists(id)" //?????? ???????????? ?????? ?????? ???????????? ????????? ?????? ?????? pk??? ?????? ??? ?????? ??????. pk??? ????????? ????????? ????????? replace??? ??????
                };
                console.log(`????????? ?????? DB ?????? params\n${JSON.stringify(queryParams, null, 2)}`);
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
                console.log('?????? ????????? ???????????????...');
                yield this.Dynamodb.update(MemberParams).promise();
                result_1.success.data = id;
                console.log('?????? ????????? ???????????? ??????');
                console.log(`?????? JSON\n${JSON.stringify(result_1.success, null, 2)}`);
                this.res.status(201).send(result_1.success);
                responseInit_1.successInit(result_1.success);
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
    //     if(err){                                    //?????? ??????
    //         fail.error = error.dbError
    //         fail.errdesc = err
    //         this.res.status(400).send(fail)
    //         console.log(`DB??????\n?????? JSON\n${JSON.stringify(fail, null, 2)}`)
    //     }
    //     else{                                      //?????? ??????
    //         success.data = this.res.locals.id
    //         this.res.status(201).send(success)
    //         console.log(`????????? ?????? ??????\n?????? JSON\n${JSON.stringify(success, null, 2)}`)
    //     }
    // }
    /**
     * ????????? ?????? ??????
     * 1. readType??? ?????? ????????? GSI??? ????????????.
     * 2. ????????? GSI??? ????????? ????????? ????????????.
     * 3. ??????????????? ????????? ????????????.
     */
    read(params, readType) {
        let index = null;
        let expAttrVals;
        switch (readType) { //Index??? ???????????? ??????. ????????? ????????? ??? ?????? ?????????
            case FeatureManager_1.toRead.name: //????????? expAttrVals??? ??????
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
        console.log(`DB ?????? params\n${JSON.stringify(params, null, 2)}`);
        this.Dynamodb.query(params, this.onRead.bind(this));
    }
    readPart(params, readType) {
        let criterion = readType;
        let value = params;
        const run = (criterion, value) => __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('DB ?????? params ?????????');
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
                console.log(`DB ?????? params ?????? ??????. ?????? JSON${JSON.stringify(queryParams, null, 2)}`);
                console.log('????????? ?????????');
                let result = yield this.Dynamodb.scan(queryParams).promise();
                console.log(`????????? ?????? ??????. ?????? JSON${JSON.stringify(result, null, 2)}`);
                if (result.Items.length == 1) {
                    result_1.success.data = result.Items;
                    console.log(`?????? JSON\n${JSON.stringify(result_1.success, null, 2)}`);
                    this.res.status(200).send(result_1.success);
                    responseInit_1.successInit(result_1.success);
                    return;
                }
                if (result.Items.length == 0) {
                    result_1.success.data = [];
                    console.log(`?????? JSON\n${JSON.stringify(result_1.success, null, 2)}`);
                    this.res.status(200).send(result_1.success);
                    responseInit_1.successInit(result_1.success);
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
                console.log('?????? ??????');
                toSort.sort(Sorter_1.campaignSort);
                primearr.sort(Sorter_1.campaignSort);
                primearr.push(...toSort);
                console.log(`?????? ??????. ????????? ??????\n${JSON.stringify(primearr, null, 2)}`);
                result_1.success.data = primearr;
                console.log(`?????? JSON\n${JSON.stringify(result_1.success, null, 2)}`);
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
        run(criterion, value);
    }
    readByPinpoint(params) {
        let pid = nbsp_1.nbsp2plus(params.value);
        let queryParams = {
            TableName: 'Campaign',
            FilterExpression: 'contains(pinpoints, :pid)',
            ExpressionAttributeValues: { ':pid': pid }
        };
        const run = () => __awaiter(this, void 0, void 0, function* () {
            try {
                let queryResult = yield this.Dynamodb.scan(queryParams).promise();
                if (queryResult.Items.length == 0) {
                    result_1.success.data = [];
                    this.res.status(200).send(result_1.success);
                    responseInit_1.successInit(result_1.success);
                    return;
                }
                result_1.success.data = queryResult.Items[0];
                this.res.status(200).send(result_1.success);
                responseInit_1.successInit(result_1.success);
            }
            catch (err) {
                result_1.fail.error = result_1.error.dbError;
                result_1.fail.errdesc = err;
                this.res.status(521).send(result_1.fail);
            }
        });
        run();
    }
    readRecommend(params) {
        let region = params.region;
        let queryParam = {
            TableName: 'Campaign',
            FilterExpression: '#region = :region',
            ExpressionAttributeNames: { '#region': 'region' },
            ExpressionAttributeValues: { ':region': region }
        };
        let memParam = {
            TableName: 'Member',
            KeyConditionExpression: 'id = :id',
            ExpressionAttributeValues: { ':id': this.req.session.passport.user.id },
            ProjectionExpression: 'playingCampaigns'
        };
        const run = () => __awaiter(this, void 0, void 0, function* () {
            let memberResult = yield this.Dynamodb.query(memParam).promise();
            let playing = memberResult.Items[0].playingCampaigns;
            let campResult = yield this.Dynamodb.scan(queryParam).promise();
            let camps = campResult.Items;
            let camp2send = camps;
            if (camps.length == 0) {
                result_1.fail.error = result_1.error.dataNotFound;
                result_1.fail.errdesc = '????????? ?????? ??? ????????????.';
                this.res.status(400).send(result_1.fail);
                return;
            }
            for (const camp of camps) {
                for (const ca of playing) {
                    if (camp.id == ca.id && ca.cleared == true) {
                        let pos = camp2send.indexOf(camp);
                        camp2send.splice(pos, 1);
                    }
                }
            }
            camp2send = recommender_1.recommend(camp2send);
            result_1.success.data = camp2send;
            this.res.status(200).send(result_1.success);
        });
        run();
    }
    scan() {
        let queryParams = {
            TableName: 'Campaign'
        };
        const run = () => __awaiter(this, void 0, void 0, function* () {
            console.log('????????? ?????? ?????? ??????');
            try {
                let queryResult = yield this.Dynamodb.scan(queryParams).promise();
                result_1.success.data = queryResult.Items;
                console.log(`?????? ??????. ?????? JSON\n${JSON.stringify(result_1.success, null, 2)}`);
                this.res.status(200).send(result_1.success);
                responseInit_1.successInit(result_1.success);
            }
            catch (err) {
                result_1.fail.error = result_1.error.dbError;
                result_1.fail.errdesc = err;
                console.log(`?????? ??????. ?????? JSON\n${JSON.stringify(result_1.fail, null, 2)}`);
                this.res.status(521).send(result_1.fail);
            }
        });
        run();
    }
    onRead(err, data) {
        if (err) { //?????? ??????
            result_1.fail.error = result_1.error.dbError;
            result_1.fail.errdesc = err;
            console.log(`?????? ??????. ?????? JSON\n${JSON.stringify(result_1.fail, null, 2)}`);
            this.res.status(521).send(result_1.fail);
        }
        else {
            if (data.Items[0] == undefined) {
                result_1.success.data = [];
            }
            else {
                result_1.success.data = data.Items;
            }
            console.log(`?????? ??????. ?????? JSON\n${JSON.stringify(result_1.success, null, 2)}`);
            this.res.status(200).send(result_1.success);
            responseInit_1.successInit(result_1.success);
        }
    }
    /**
     * ????????? ?????? ??????
     * 1. ???????????? ????????? id??? ????????? ????????? ??????
     * 2. ?????? ????????? ??? ????????? ?????? ??????
     * 3. ?????? ??????
     */
    update(params) {
        let getCampParam = {
            TableName: 'Campaign',
            KeyConditionExpression: 'id = :id',
            ExpressionAttributeValues: { ':id': params.caid }
        };
        let couponParam = {
            TableName: 'Coupon',
            Key: { id: null },
            UpdateExpression: 'set #name = :name, description = :desc, endDate = :end, goods = :goods, imgs = :imgs, #limit = :limit',
            ExpressionAttributeNames: { '#name': 'name', '#limit': 'limit' },
            ExpressionAttributeValues: { ':name': null, ':desc': null, ':end': null, ':goods': null, ':imgs': null, ':limit': null }
        };
        let pinpointParam = {
            TableName: 'Pinpoint',
            Key: { id: null },
            UpdateExpression: 'set #name = :name, description = :desc, imgs = :imgs, latitude = :latitude, longitude = :longitude, quiz = :quiz',
            ExpressionAttributeNames: { '#name': 'name' },
            ExpressionAttributeValues: { ':name': null, ':desc': null, ':imgs': null, ':latitude': null, ':longitude': null, ':quiz': null }
        };
        let campaignParam = {
            TableName: 'Campaign',
            Key: { id: params.caid },
            UpdateExpression: 'set #name = :name, description = :desc, imgs = :imgs, #region = :region',
            ExpressionAttributeNames: { '#name': 'name', '#region': 'region' },
            ExpressionAttributeValues: { ':name': null, ':desc': null, ':imgs': null, ':region': null }
        };
        let memParam = {
            TableName: 'Member',
            KeyConditionExpression: 'id = :id',
            ExpressionAttributeValues: { ':id': this.req.session.passport.user.id },
            projectionExpression: 'myCampaigns'
        };
        const run = () => __awaiter(this, void 0, void 0, function* () {
            try {
                let campaignResult = yield this.Dynamodb.query(getCampParam).promise();
                let camp = campaignResult.Items[0];
                if (camp == undefined) {
                    result_1.fail.error = result_1.error.dataNotFound;
                    result_1.fail.errdesc = '???????????? ?????? ??? ????????????.';
                    this.res.status(400).send(result_1.fail);
                    return;
                }
                let campCoupon = [];
                campCoupon.push(...camp.coupons);
                campCoupon.push(...camp.pcoupons);
                let campPinpoint = camp.pinpoints;
                let coupons = params.coupons;
                let pinpoints = params.pinpoints;
                let campaign = params;
                console.log('????????? ????????? ?????? ?????????');
                let memResult = yield this.Dynamodb.query(memParam).promise();
                let myCamp = memResult.Items[0].myCampaigns;
                let pos = myCamp.indexOf(params.caid);
                if (pos == -1) {
                    result_1.fail.error = result_1.error.invalReq;
                    result_1.fail.errdesc = '????????? ????????? ???????????? ????????? ??? ????????????.';
                    this.res.status(400).send(result_1.fail);
                    return;
                }
                console.log('????????? ????????? ?????? ??????');
                console.log('?????? ????????? ?????????');
                for (const coupon of coupons) {
                    let pos = campCoupon.indexOf(coupon.id);
                    if (pos == -1) {
                        console.log('???????????? ?????? ???????????????.');
                        result_1.fail.error = result_1.error.invalReq;
                        result_1.fail.errdesc = '???????????? ?????? ???????????????.';
                        this.res.status(400).send(result_1.fail);
                        return;
                    }
                }
                console.log('?????? ????????? ?????? ??????');
                console.log('???????????? ????????? ?????????');
                for (const pinpoint of pinpoints) {
                    let pos = campPinpoint.indexOf(pinpoint.id);
                    if (pos == -1) {
                        console.log('???????????? ?????? ?????????????????????.');
                        result_1.fail.error = result_1.error.invalReq;
                        result_1.fail.errdesc = '???????????? ?????? ?????????????????????.';
                        this.res.status(400).send(result_1.fail);
                        return;
                    }
                }
                console.log('???????????? ????????? ?????? ??????');
                console.log('?????? ?????? ??????');
                for (const coupon of coupons) {
                    couponParam.Key.id = coupon.id;
                    couponParam.ExpressionAttributeValues[":name"] = coupon.name;
                    couponParam.ExpressionAttributeValues[":desc"] = coupon.description;
                    couponParam.ExpressionAttributeValues[":end"] = coupon.endDate;
                    couponParam.ExpressionAttributeValues[":goods"] = coupon.goods;
                    couponParam.ExpressionAttributeValues[":imgs"] = coupon.imgs;
                    couponParam.ExpressionAttributeValues[":limit"] = Number(coupon.limit);
                    yield this.Dynamodb.update(couponParam).promise();
                }
                console.log('?????? ?????? ??????');
                console.log('???????????? ?????? ??????');
                for (const pinpoint of pinpoints) {
                    pinpointParam.Key.id = pinpoint.id;
                    pinpointParam.ExpressionAttributeValues[":name"] = pinpoint.name;
                    pinpointParam.ExpressionAttributeValues[":desc"] = pinpoint.description;
                    pinpointParam.ExpressionAttributeValues[":imgs"] = pinpoint.imgs;
                    pinpointParam.ExpressionAttributeValues[":latitude"] = Number(pinpoint.latitude);
                    pinpointParam.ExpressionAttributeValues[":longitude"] = Number(pinpoint.longitude);
                    pinpointParam.ExpressionAttributeValues[":quiz"] = pinpoint.quiz;
                    yield this.Dynamodb.update(pinpointParam).promise();
                }
                console.log('???????????? ?????? ??????');
                campaignParam.ExpressionAttributeValues[":desc"] = campaign.description;
                campaignParam.ExpressionAttributeValues[":imgs"] = campaign.imgs;
                campaignParam.ExpressionAttributeValues[":name"] = campaign.name;
                campaignParam.ExpressionAttributeValues[":region"] = campaign.region;
                yield this.Dynamodb.update(campaignParam).promise();
                result_1.success.data = '????????? ?????? ??????';
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
    delete(params) {
    }
    // ???????????? ?????? ??????
    readPlaying(params) {
        params.caid = nbsp_1.nbsp2plus(params.caid);
        let campaignParams = {
            TableName: 'Campaign',
            KeyConditionExpression: 'id = :id',
            ProjectionExpression: '#users, pinpoints',
            ExpressionAttributeValues: { ':id': params.caid },
            ExpressionAttributeNames: { '#users': 'users' }
        };
        let MemberParams = {
            RequestItems: {
                'Member': {
                    Keys: [],
                    ProjectionExpression: 'nickname, profileImg, playingCampaigns'
                }
            }
        };
        const run = () => __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('????????? ?????????');
                let campResult = yield this.Dynamodb.query(campaignParams).promise(); // ???????????? ????????? ??????, ???????????? ??????
                console.log('????????? ?????? ??????');
                if (campResult.Items.length == 0) {
                    result_1.fail.error = result_1.error.dataNotFound;
                    result_1.fail.errdesc = '???????????? ?????? ??? ????????????.';
                    this.res.status(400).send(result_1.fail);
                    return;
                }
                let users = campResult.Items[0].users; // ????????? ??????
                let pinpoints = campResult.Items[0].pinpoints; // ???????????? ????????????
                if (users.length == 0) { // ???????????? ????????? ?????? ??????
                    console.log('???????????? ????????? ????????????.');
                    result_1.success.data = [];
                    this.res.status(200).send(result_1.success);
                    responseInit_1.successInit(result_1.success);
                    return;
                }
                console.log('???????????? ?????? ?????????');
                for (const id of users) {
                    MemberParams.RequestItems.Member.Keys.push({ 'id': id });
                }
                console.log('???????????? ?????? ?????? ??????\n?????? ?????????');
                let result = yield this.Dynamodb.batchGet(MemberParams).promise();
                let member = result.Responses.Member;
                let response = [];
                console.log(`???????????? ?????? ??????\n${JSON.stringify(member, null, 2)}`);
                for (const mem of member) {
                    let playing = mem.playingCampaigns;
                    for (const camp of playing) {
                        if (camp.id == params.caid) {
                            camp.clearedPinpoints = camp.pinpoints;
                            camp.pinpoints = pinpoints;
                            camp.nickname = mem.nickname;
                            camp.profileImg = mem.profileImg;
                            delete camp.id;
                            response.push(camp);
                            break;
                        }
                    }
                }
                result_1.success.data = response;
                this.res.status(200).send(result_1.success);
                responseInit_1.successInit(result_1.success);
            }
            catch (err) {
                result_1.fail.error = result_1.error.dbError;
                result_1.fail.errdesc = err;
                this.res.status(521).send(result_1.fail);
            }
        });
        run();
    }
    participate(params) {
        if (this.req.session.passport.user.id != params.uid) { //?????? ?????? ??????
            result_1.fail.error = result_1.error.invalAcc;
            result_1.fail.errdesc = '????????? ????????? iD';
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
            UpdateExpression: 'set playingCampaigns = list_append(if_not_exists(playingCampaigns, :emptylist), :newCampaign)',
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
        let blockParam = {
            TableName: 'Block',
            KeyConditionExpression: 'uid = :uid and tid = :tid',
            ExpressionAttributeValues: { ':uid': this.req.session.passport.user.id, ':tid': params.caid }
        };
        let deleteParam = {
            TableName: 'Block',
            Key: { uid: this.req.session.passport.user.id, tid: params.caid }
        };
        const run = () => __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('????????? ?????? ?????? ?????????...');
                let campCheckResult = yield this.Dynamodb.query(campaigncheck).promise();
                if (campCheckResult.Items[0] == undefined) {
                    result_1.fail.error = result_1.error.invalKey;
                    result_1.fail.errdesc = '????????? ????????? id';
                    this.res.status(400).send(result_1.fail);
                    return;
                }
                console.log('????????? ?????? ?????? ??????');
                let MycheckResult = yield this.Dynamodb.query(myCampCheck).promise();
                let myCampaigns = MycheckResult.Items[0].myCampaigns;
                let playingCampaigns = MycheckResult.Items[0].playingCampaigns;
                console.log('????????? ?????? ??????');
                console.log('?????? ?????? ?????? ?????????...');
                for (let i = 0; i < myCampaigns.length; i++) {
                    if (myCampaigns[i] == cId) {
                        result_1.fail.error = result_1.error.invalReq;
                        result_1.fail.errdesc = '????????? ????????? ???????????? ???????????? ??? ????????????.';
                        this.res.status(400).send(result_1.fail);
                        return;
                    }
                }
                console.log('?????? ?????? ?????? ??????');
                console.log('?????? ?????? ?????????');
                let blockResult = yield this.Dynamodb.query(blockParam).promise();
                let block = blockResult.Items[0];
                if (block != undefined) {
                    let end = new Date(block.start).getTime() + block.time;
                    let curr = new Date(Date.now() + 9 * 60 * 60 * 1000).getTime();
                    if (curr < end) {
                        let diff = end - curr;
                        let day = Math.floor(diff / 1000 / 60 / 60 / 24);
                        let hour = Math.floor(diff / 1000 / 60 / 60) % 60;
                        let min = Math.floor(diff / 1000 / 60) % 60;
                        let sec = Math.floor(diff / 1000) % 60;
                        result_1.fail.error = result_1.error.invalReq;
                        result_1.fail.errdesc = `???????????? ?????? ?????? ??????????????????. ${day}??? ${hour}?????? ${min}??? ${sec}??? ????????????.`;
                        this.res.status(400).send(result_1.fail);
                        return;
                    }
                    else {
                        yield this.Dynamodb.delete(deleteParam).promise();
                    }
                }
                console.log('????????? ?????? ?????????...');
                for (let i = 0; i < playingCampaigns.length; i++) {
                    if (playingCampaigns[i].id == cId) {
                        result_1.fail.error = result_1.error.invalReq;
                        result_1.fail.errdesc = '?????? ???????????? ?????? ????????? ??????????????????.';
                        this.res.status(400).send(result_1.fail);
                        return;
                    }
                }
                console.log('????????? ?????? ??????');
                console.log('????????? ?????? ??????');
                console.log('DB ?????? ??????');
                let pinpoint2add = [];
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
                console.log(`DB ?????? ??????.\n?????? JSOn\n${JSON.stringify(result_1.success.data, null, 2)}`);
                this.res.status(201).send(result_1.success);
                responseInit_1.successInit(result_1.success);
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
        let date = new Date(Date.now() + 9 * 60 * 60 * 1000);
        let hash = CryptoJS.SHA256(params.caid + date.toString()); //id ??????
        params.rid = hash.toString(CryptoJS.enc.Base64);
        if (userid != params.comments.userId) { //????????? id??? ????????? id??? ?????? ??????
            result_1.fail.error = result_1.error.invalKey;
            result_1.fail.errdesc = '?????? ????????? id??? ???????????? ????????????.';
            this.res.status(400).send(result_1.fail);
            return;
        }
        if (params.rated > 5 || params.rated < 0) {
            result_1.fail.error = result_1.error.invalReq;
            result_1.fail.errdesc = '????????? 5??? ??????, 0??? ??????????????? ?????????.';
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
        let memberComment = [{
                type: 'campaign',
                id: params.caid,
                coid: params.rid
            }];
        let memberParam = {
            TableName: 'Member',
            Key: { id: this.req.session.passport.user.id },
            UpdateExpression: 'set comments = list_append(if_not_exists(comments, :emptylist), :newcomment)',
            ExpressionAttributeValues: { ':newcomment': memberComment, ':emptylist': [] },
            ReturnValues: 'UPDATED_NEW',
            ConditionExpression: 'attribute_exists(id)'
        };
        const run = () => __awaiter(this, void 0, void 0, function* () {
            try {
                let campaignResult = yield this.Dynamodb.query(campaignParams).promise();
                let comments = campaignResult.Items[0].comments;
                for (const comm of comments) {
                    if (comm.userId == userid) {
                        result_1.fail.error = result_1.error.invalReq;
                        result_1.fail.errdesc = '?????? ????????? ????????? ????????? ?????????.';
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
                let updateMember = yield this.Dynamodb.update(memberParam).promise();
                result_1.success.data = comment[0];
                this.res.status(201).send(result_1.success);
                responseInit_1.successInit(result_1.success);
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
            result_1.fail.errdesc = '????????? id?????? ????????????.';
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
                console.log('?????? ?????????');
                let result = yield this.Dynamodb.query(queryParams).promise();
                console.log(`?????? ??????\n${JSON.stringify(result.Items, null, 2)}`);
                result_1.success.data = result.Items[0].comments;
                this.res.status(200).send(result_1.success);
                responseInit_1.successInit(result_1.success);
                responseInit_1.successInit(result_1.success);
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
            result_1.fail.errdesc = '?????? ?????? ?????? ????????? ???????????????.';
            this.res.status(400).send(result_1.fail);
            return;
        }
        if (userid != params.uid) { //????????? id??? ????????? id??? ?????? ??????
            result_1.fail.error = result_1.error.invalKey;
            result_1.fail.errdesc = '?????? ????????? id??? ???????????? ????????????.';
            this.res.status(400).send(result_1.fail);
            return;
        }
        if (params.rated > 5 || params.rated < 0) {
            result_1.fail.error = result_1.error.invalReq;
            result_1.fail.errdesc = '????????? 5??? ??????, 0??? ??????????????? ?????????.';
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
                    result_1.fail.errdesc = "?????? ????????? id??? ???????????? ????????????.";
                    this.res.status(400).send(result_1.fail);
                    return;
                }
                let comments = yield this.Dynamodb.query(findParams).promise();
                if (comments.Items[0] == undefined) {
                    result_1.fail.error = result_1.error.dataNotFound;
                    result_1.fail.errdesc = "???????????? ?????? ??? ????????????.";
                    this.res.status(400).send(result_1.fail);
                    return;
                }
                console.log('?????? ?????????...');
                for (let i = 0; i < comments.Items[0].comments.length; i++) {
                    let rid = comments.Items[0].comments[i].id;
                    let uid = comments.Items[0].comments[i].userId;
                    if (rid == params.rid && uid == params.uid) {
                        console.log('?????? ??????');
                        if (comments.Items[0].comments[i].text == '?????????????????? ?????????????????????.') {
                            result_1.fail.error = result_1.error.invalReq;
                            result_1.fail.errdesc = '????????? ???????????????.';
                            this.res.status(400).send(result_1.fail);
                            return;
                        }
                        if (params.text == undefined) {
                            comments.Items[0].comments[i].rated = params.rated;
                            comments.Items[0].comments[i].time = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString();
                            comments.Items[0].comments[i].imgs = params.imgs;
                            result_1.success.data = comments.Items[0].comments[i];
                        }
                        else if (params.rated == undefined) {
                            comments.Items[0].comments[i].text = params.text;
                            comments.Items[0].comments[i].time = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString();
                            comments.Items[0].comments[i].imgs = params.imgs;
                            result_1.success.data = comments.Items[0].comments[i];
                        }
                        else {
                            comments.Items[0].comments[i].rated = params.rated;
                            comments.Items[0].comments[i].text = params.text;
                            comments.Items[0].comments[i].time = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString();
                            comments.Items[0].comments[i].imgs = params.imgs;
                            result_1.success.data = comments.Items[0].comments[i];
                        }
                        break;
                    }
                    if (i == comments.Items[0].comments.length - 1) {
                        result_1.fail.error = result_1.error.dataNotFound;
                        result_1.fail.errdesc = "????????? ?????? ??? ????????????.";
                        this.res.status(400).send(result_1.fail);
                        return;
                    }
                }
                console.log(comments.Items[0].comments);
                updateParams.ExpressionAttributeValues[":newcomment"] = comments.Items[0].comments;
                console.log('?????? ?????????...');
                let updateResult = yield this.Dynamodb.update(updateParams).promise();
                this.res.status(200).send(result_1.success);
                responseInit_1.successInit(result_1.success);
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
            result_1.fail.errdesc = "??????????????? id??? ???????????? ????????????.";
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
        let memberParams = {
            TableName: 'Member',
            KeyConditionExpression: 'id = :id',
            ProjectionExpression: 'comments',
            ExpressionAttributeValues: { ':id': params.uid }
        };
        let memberUpdateParams = {
            TableName: 'Member',
            Key: { id: params.uid },
            UpdateExpression: 'set comments = :newcomment',
            ExpressionAttributeValues: { ':newcomment': null },
            ReturnValues: 'UPDATED_NEW',
            ConditionExpression: 'attribute_exists(id)'
        };
        const run = () => __awaiter(this, void 0, void 0, function* () {
            try {
                let comments = yield this.Dynamodb.query(findParams).promise();
                if (comments.Items[0] == undefined) {
                    result_1.fail.error = result_1.error.dataNotFound;
                    result_1.fail.errdesc = "???????????? ?????? ??? ????????????.";
                    this.res.status(400).send(result_1.fail);
                    return;
                }
                console.log('?????? ?????????...');
                for (let i = 0; i < comments.Items[0].comments.length; i++) {
                    let rid = comments.Items[0].comments[i].id;
                    let uid = comments.Items[0].comments[i].userId;
                    if (rid == params.rid && uid == params.uid) {
                        comments.Items[0].comments.splice(i, 1);
                        break;
                    }
                    if (i == comments.Items[0].comments.length - 1) {
                        result_1.fail.error = result_1.error.invalKey;
                        result_1.fail.errdesc = '????????? ?????? ??? ????????????.';
                        this.res.status(400).send(result_1.fail);
                        return;
                    }
                }
                console.log(comments.Items[0].comments);
                let findMember = yield this.Dynamodb.query(memberParams).promise();
                let mycomments = findMember.Items[0].comments;
                for (let i = 0; i < mycomments.length; i++) {
                    if (mycomments[i].id == params.caid) {
                        mycomments.splice(i, 1);
                        break;
                    }
                }
                memberUpdateParams.ExpressionAttributeValues[":newcomment"] = mycomments;
                yield this.Dynamodb.update(memberUpdateParams).promise();
                updateParams.ExpressionAttributeValues[":newcomment"] = comments.Items[0].comments;
                let updateResult = yield this.Dynamodb.update(updateParams).promise();
                result_1.success.data = updateResult.Attributes.comments;
                this.res.status(200).send(result_1.success);
                responseInit_1.successInit(result_1.success);
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
