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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const FeatureManager_1 = require("./FeatureManager");
const CryptoJS = __importStar(require("crypto-js"));
const result_1 = require("../../static/result");
const nbsp_1 = require("../Logics/nbsp");
const RankingManager_1 = __importDefault(require("./RankingManager"));
const responseInit_1 = require("../Logics/responseInit");
class PinpointManager extends FeatureManager_1.FeatureManager {
    /**
     * ???????????? ?????? ??????
     * 1. ???????????? ??????, ???/????????? hash id ??????
     * 2. ?????? id??? ????????? DB Insert
     * 3. ConditionExpression??? ?????? id??? ???????????? ??????
     */
    insert(params) {
        let date = new Date(Date.now() + 9 * 60 * 60 * 1000);
        let hash = CryptoJS.SHA256(params.name + params.latitude.toString() + params.longitude.toString() + date.toString()); //id ??????
        params.id = hash.toString(CryptoJS.enc.Base64);
        let checkCouponParams = {
            TableName: 'Coupon',
            KeyConditionExpression: 'id = :id',
            ExpressionAttributeValues: {
                ':id': params.coupons
            }
        };
        let queryParams = {
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
            ConditionExpression: "attribute_not_exists(id)" // ?????? ???????????? ?????? ?????? ???????????? ????????? ?????? ?????? pk??? ?????? ??? ?????? ??????. pk??? ????????? ????????? ????????? replace??? ??????
        };
        const run = () => __awaiter(this, void 0, void 0, function* () {
            try {
                if (params.coupons != undefined) { // ???????????? ????????? ???????????? ?????? ????????? ??????                
                    let checkCoupon = yield this.Dynamodb.query(checkCouponParams).promise();
                    if (checkCoupon.Items[0] == undefined) { //data.Item == undefined -> ???????????? ID??? ??????
                        console.log(`???????????? ?????? ??????\nDB ?????? Params\n${JSON.stringify(queryParams, null, 2)}`);
                        result_1.fail.error = result_1.error.invalKey;
                        result_1.fail.errdesc = "Coupon you send does not exist in DB";
                        this.res.status(400).send(result_1.fail);
                        return;
                    }
                }
                this.res.locals.id = params.id;
                let queryResult = yield this.Dynamodb.put(queryParams).promise();
                result_1.success.result = params.id;
                this.res.status(201).send(result_1.success);
                responseInit_1.successInit(result_1.success);
                console.log(`?????? JSON\n${JSON.stringify(result_1.success, null, 2)}`);
            }
            catch (err) {
                console.log(err);
                result_1.fail.error = result_1.error.dbError;
                result_1.fail.errdesc = err;
                this.res.status(400).send(result_1.fail);
            }
        });
        run();
    }
    /**
     * ???????????? ?????? ??????
     * batchGet??? ?????? -> ???????????? ??????????????? ?????? ?????? ?????? ?????? ????????? ??????
     * 1. batchget??? ?????? DB?????? ??????????????? ?????????
     * 2. ??????????????? ??????
     */
    read(params) {
        if (params[0].id == undefined) {
            result_1.fail.error = result_1.error.invalReq;
            result_1.fail.errdesc = 'Missing Required Values in Request. Please check API Document';
            this.res.status(400).send(result_1.fail);
            return;
        }
        console.log(params);
        let queryParams = {
            RequestItems: {
                'Pinpoint': {
                    Keys: params
                }
            }
        };
        params[0].id = nbsp_1.nbsp2plus(params[0].id);
        const run = () => __awaiter(this, void 0, void 0, function* () {
            try {
                let test = yield this.Dynamodb.batchGet(queryParams, this.onRead.bind(this)).promise(); // read??? ???????????? ?????? ??????
                if (this.res.locals.UnprocessedKeys != undefined) { //?????? ?????? ??????
                    result_1.fail.error = result_1.error.dbError;
                    result_1.fail.errdesc = 'None of Keys are processed';
                    this.res.status(400).send(result_1.fail);
                    return;
                }
                result_1.success.data = this.res.locals.result.Pinpoint;
                this.res.status(201).send(result_1.success);
                responseInit_1.successInit(result_1.success);
            }
            catch (err) {
                console.log(err);
                result_1.fail.error = result_1.error.dbError;
                result_1.fail.errdesc = err;
                this.res.status(400).send(result_1.fail);
            }
        });
        run();
    }
    readList(params) {
        let id = params.value;
        let queryParams = {
            TableName: 'Campaign',
            KeyConditionExpression: 'id = :id',
            ProjectionExpression: 'pinpoints',
            ExpressionAttributeValues: { ':id': id }
        };
        const run = () => __awaiter(this, void 0, void 0, function* () {
            console.log('???????????? ?????? ???????????????...');
            let queryResult = yield this.Dynamodb.query(queryParams).promise();
            let pinpointList = [];
            if (queryResult.Items[0] == undefined) {
                result_1.fail.error = result_1.error.invalKey;
                result_1.fail.errdesc = '???????????? ?????? ??? ????????????.';
                this.res.status(400).send(result_1.fail);
                return;
            }
            console.log(`???????????? id\n${JSON.stringify(queryResult.Items[0].pinpoints)}`);
            queryResult.Items[0].pinpoints.forEach((id) => {
                let obj = {
                    'id': id
                };
                pinpointList.push(obj);
            });
            this.read(pinpointList);
        });
        run();
    }
    onRead(err, data) {
        if (err) {
            result_1.fail.error = result_1.error.dbError;
            result_1.fail.errdesc = err;
            this.res.status(400).send(result_1.fail);
        }
        else {
            this.res.locals.result = data.Responses;
        }
    }
    /**
     * ???????????? ?????? ??????
     * 1. ???????????? update??????
     * 2. ?????? /?????? ????????? ??????
     */
    update(params) {
        let queryParams = {
            TableName: 'Pinpoint',
            Key: { id: params.id },
            UpdateExpression: 'set imgs = :newimgs',
            ExpressionAttributeValues: { ':newimgs': params.imgs },
            ReturnValues: 'UPDATED_NEW',
            ConditionExpression: "attribute_exists(id)"
        };
        this.Dynamodb.update(queryParams, this.onUpdate.bind(this));
    }
    onUpdate(err, data) {
        if (err) {
            result_1.fail.error = result_1.error.dbError;
            result_1.fail.errdesc = err;
            this.res.status(400).send(result_1.fail);
        }
        else {
            result_1.success.data = data.Attributes;
            this.res.status(201).send(result_1.success);
            responseInit_1.successInit(result_1.success);
        }
    }
    /**
     * ???????????? ?????? ??????
     * 1. ????????? ?????? ????????? ???????????? ??????
     * 2. ReturnValues??? ?????? ?????? ??? ????????? ??????
     * 3. ??????????????? ??????
     */
    delete(params) {
        let queryParams = {
            TableName: 'Pinpoint',
            Key: {
                'id': params.id
            },
            ReturnValues: 'ALL_OLD'
        };
        this.Dynamodb.delete(queryParams, this.onDelete.bind(this));
    }
    onDelete(err, data) {
        if (err) {
            result_1.fail.error = result_1.error.dbError;
            result_1.fail.errdesc = err;
            this.res.status(401).send(result_1.fail);
        }
        else {
            result_1.success.data = data.Attributes;
            this.res.status(200).send(result_1.success);
            responseInit_1.successInit(result_1.success);
        }
    }
    /**
     * ???????????? ?????? ?????? API
     */
    /**
     * ???????????? ?????? ?????? ??????
     * 1. ?????????????????? ???????????? ????????? get ??????
     * 2. ProjectionExpression??? ?????? ?????? ????????? ?????????
     * 3. ??????????????? ??????
     */
    readDetail(params) {
        params.id = nbsp_1.nbsp2plus(params.id);
        let queryParams = {
            TableName: 'Pinpoint',
            Key: {
                'id': params.id
            },
            ProjectionExpression: 'description'
        };
        this.Dynamodb.get(queryParams, this.onReadDetail.bind(this));
    }
    onReadDetail(err, data) {
        if (err) {
            result_1.fail.error = result_1.error.dbError;
            result_1.fail.errdesc = err;
            this.res.status(400).send(result_1.fail);
            return;
        }
        if (data.Item == undefined) {
            result_1.fail.error = result_1.error.invalKey;
            result_1.fail.errdesc = 'Provided Pinopint Key does not match';
            this.res.status(400).send(result_1.fail);
        }
        else {
            result_1.success.data = data.Item;
            this.res.status(201).send(result_1.success);
            responseInit_1.successInit(result_1.success);
        }
    }
    /**
     * ???????????? ???????????? ?????? ??????
     * 1. ?????????????????? ??? ??????
     * 2. ConditionExpression??? ?????? ?????? ???????????? ??????????????? ???????????? ??????
     *    => DynamoDB????????? ???????????? Key??? ?????? ?????? ???????????? Insert
     * 3. ??????????????? ?????? ??????
     */
    updateDetail(params) {
        let queryParams = {
            TableName: 'Pinpoint',
            Key: { id: params.id },
            UpdateExpression: 'set description = :newdesc',
            ExpressionAttributeValues: { ':newdesc': params.description },
            ReturnValues: 'UPDATED_NEW',
            ConditionExpression: "attribute_exists(id)"
        };
        this.Dynamodb.update(queryParams, this.onUpdateDetail.bind(this));
    }
    onUpdateDetail(err, data) {
        if (err) {
            result_1.fail.error = result_1.error.dbError;
            result_1.fail.errdesc = err;
            this.res.status(400).send(result_1.fail);
        }
        else {
            result_1.success.data = data.Attributes;
            this.res.status(201).send(result_1.success);
            responseInit_1.successInit(result_1.success);
        }
    }
    /**
     * ???????????? ?????? API
     */
    /**
     * ?????? ?????? ??????
     * 1. ?????????????????? ??? ??????
     * 2. RetrunValues??? ?????? ????????? ??? + ConditionExpression??? ?????? ?????? ???????????? ??????
     * 3. ??????????????? ?????? ??????
     */
    insertQuiz(params) {
        let queryParams = {
            TableName: 'Pinpoint',
            Key: { id: params.id },
            UpdateExpression: 'set quiz = :quiz',
            ExpressionAttributeValues: { ':quiz': params.quiz },
            ReturnValues: 'UPDATED_NEW',
            ConditionExpression: "attribute_exists(id)"
        };
        this.Dynamodb.update(queryParams, this.onInsertQuiz.bind(this));
    }
    onInsertQuiz(err, data) {
        if (err) {
            result_1.fail.error = result_1.error.dbError;
            result_1.fail.errdesc = err;
            this.res.status(400).send(result_1.fail);
        }
        else {
            result_1.success.data = data.Attributes;
            this.res.status(201).send(result_1.success);
            responseInit_1.successInit(result_1.success);
        }
    }
    /**
     * ?????? ?????? ??????
     * 1. ?????????????????? ??? ??????
     * 2. ProjectionExpression??? ?????? ????????? ?????????
     * 3. ??????????????? ??????
     */
    readQuiz(params) {
        params.pid = nbsp_1.nbsp2plus(params.pid);
        let queryParams = {
            TableName: 'Pinpoint',
            Key: {
                'id': params.pid
            },
            ProjectionExpression: 'quiz'
        };
        this.Dynamodb.get(queryParams, this.onReadQuiz.bind(this));
    }
    onReadQuiz(err, data) {
        if (err) {
            result_1.fail.error = result_1.error.dbError;
            result_1.fail.errdesc = err;
            this.res.status(400).send(result_1.fail);
        }
        else {
            let quiz = data.Item.quiz;
            delete quiz.answer;
            if (quiz.type == '?????????') {
                delete quiz.choices;
            }
            result_1.success.data = quiz;
            this.res.status(201).send(result_1.success);
            responseInit_1.successInit(result_1.success);
        }
    }
    /**
     * ?????? ?????? ??????
     * 1. ?????????????????? ??? ??????
     * 2. ReturnValues??? ?????? ?????? ????????? ?????? ??????
     * 3. ConditionExpression??? ?????? ?????? ???????????? ????????? ??????
     * 4. ??????????????? ?????? ??????
     */
    updateQuiz(params) {
        let queryParams = {
            TableName: 'Pinpoint',
            Key: { id: params.pid },
            UpdateExpression: 'set quiz = :quiz',
            ExpressionAttributeValues: { ':quiz': params.quiz },
            ReturnValues: 'UPDATED_NEW',
            ConditionExpression: "attribute_exists(id)"
        };
        this.Dynamodb.update(queryParams, this.onUpdateQuiz.bind(this));
    }
    onUpdateQuiz(err, data) {
        if (err) {
            result_1.fail.error = result_1.error.dbError;
            result_1.fail.errdesc = err;
            this.res.status(400).send(result_1.fail);
        }
        else {
            result_1.success.data = data.Attributes;
            this.res.status(201).send(result_1.success);
            responseInit_1.successInit(result_1.success);
        }
    }
    /**
     * ???????????? ??????
     * 1. ???????????? ????????? ??????
     * 2. ???????????? ????????? / ??????????????? ?????? ??????
     * 3. ?????? ??????
     * 4. ????????? ??????
     */
    solveQuiz(params) {
	console.log(params)
	console.log(typeof(params.answer))
        let queryParams = {
            TableName: 'Pinpoint',
            KeyConditionExpression: 'id = :id',
            ProjectionExpression: 'quiz, coupons',
            ExpressionAttributeValues: { ':id': params.pid }
        };
        let memberparams = {
            TableName: 'Member',
            KeyConditionExpression: 'id = :id',
            ProjectionExpression: 'playingCampaigns',
            ExpressionAttributeValues: { ':id': this.req.session.passport.user.id }
        };
        let campParams = {
            TableName: 'Campaign',
            KeyConditionExpression: 'id = :id',
            ProjectionExpression: 'pinpoints, coupons',
            ExpressionAttributeValues: { ':id': params.caid }
        };
        let updateParams = {
            TableName: 'Member',
            Key: {
                id: this.req.session.passport.user.id
            },
            UpdateExpression: 'set coupons = list_append(if_not_exists(coupons, :emptylist), :newcoupon), playingCampaigns = :newPlaying, badge = list_append(badge, :newbadge)',
            ExpressionAttributeValues: { ':emptylist': [], ':newcoupon': null, ':newPlaying': null, ':newbadge': null },
            ConditionExpression: 'attribute_exists(id)'
        };
        let couponParams = {
            TableName: 'Coupon',
            Key: null,
            UpdateExpression: 'add issued :number',
            ConditionExpression: 'attribute_exists(id) and issued < #limit',
            ExpressionAttributeValues: { ':number': 1 },
            ExpressionAttributeNames: { '#limit': 'limit' }
        };
        let batchCoupon = {
            RequestItems: {
                'Coupon': {
                    Keys: []
                }
            }
        };
        const run = () => __awaiter(this, void 0, void 0, function* () {
            try {
                if (params.monsterImg == undefined) {
		    console.log('????????? ????????? ??????')
                    result_1.fail.error = result_1.error.invalReq;
                    result_1.fail.errdesc = 'No Monster Img Info';
                    this.res.status(400).send(result_1.fail);
                    return;
                }
                let isCampClear = false; //????????? ????????? ??????. true??? ?????? ???????????? ?????? ?????? + ????????? ????????? ??????. default??? false
                let failedQuiz = this.req.session.passport.user.quiz;
                if (failedQuiz.length != 0) {
                    for (const quiz of failedQuiz) {
                        if (quiz.id == params.pid) {
                            let currTime = new Date(Date.now() + 9 * 60 * 60 * 1000).getTime();
                            let limitTime = new Date(quiz.time).getTime();
                            let diff = currTime - limitTime;
                            if (diff < 180000) {
                                quiz.time = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString();
                                break;
                            }
                            else {
                                result_1.fail.error = result_1.error.invalReq;
                                result_1.fail.errdesc = '????????????!';
                                this.res.status(400).send(result_1.fail);
                                return;
                            }
                        }
                    }
                }
                result_1.success.data = {};
                result_1.success.data.isClear = false;
                console.log('????????? ????????? ?????????');
                let memberResult = yield this.Dynamodb.query(memberparams).promise();
                let playingCampaigns = memberResult.Items[0].playingCampaigns;
                console.log(`????????? ????????? ?????? ??????\n${JSON.stringify(playingCampaigns, null, 2)}`);
                console.log('???????????? ????????? ?????? ?????????');
                let campResult = yield this.Dynamodb.query(campParams).promise();
                let pinpoints = campResult.Items[0].pinpoints;
                let campcoupon = campResult.Items[0].coupons;
                for (const camp of playingCampaigns) { // ????????? ????????? ????????????
                    if (camp.id == params.caid) { // ?????? ???????????? ?????????
                        if (camp.cleared == true) { // ?????? ???????????? ???????????? ??????
                            result_1.fail.error = result_1.error.invalReq;
                            result_1.fail.errdesc = '?????? ???????????? ??????????????????.';
                            this.res.status(400).send(result_1.fail);
                            responseInit_1.successInit(result_1.success);
                            return;
                        }
                        for (const id of camp.pinpoints) { // ????????? ?????? ?????? ?????? ???????????? ????????? ?????? ??????
                            if (id == params.pid) {
                                console.log('?????? ???????????? ?????????????????????.');
                                result_1.fail.error = result_1.error.invalReq;
                                result_1.fail.errdesc = '?????? ???????????? ?????????????????????.';
                                this.res.status(400).send(result_1.fail);
                                responseInit_1.successInit(result_1.success);
                                return;
                            }
                        }
                        if (pinpoints.length - 1 == camp.pinpoints.length) { // ??? ???????????? ????????? = ????????? ???????????? ??????
                            isCampClear = true;
                        }
                        break;
                    }
                }
                console.log('???????????? ????????? ?????? ?????? ??????');
                console.log('???????????? ?????? ?????????');
                let result = yield this.Dynamodb.query(queryParams).promise();
                let quiz = result.Items[0].quiz;
                let coupons = result.Items[0].coupons;
                console.log(`???????????? ?????? ??????\n${JSON.stringify(result.Items[0], null, 2)}`);
                if (quiz.answer != params.answer) { //????????? ?????? ?????? ?????? ????????? ?????? ??? ??????
                    result_1.fail.error = result_1.error.invalKey;
                    result_1.fail.errdesc = '???????????????.';
                    this.res.status(400).send(result_1.fail);
                    responseInit_1.successInit(result_1.success);
                    return;
                }
                // ?????? ????????? ??????
                updateParams.ExpressionAttributeValues[":newbadge"] = [params.monsterImg];
                // ????????? ???????????? ?????? cleared??? true???
                for (const camp of playingCampaigns) {
                    if (camp.id == params.caid) {
                        camp.pinpoints.push(params.pid);
                        if (isCampClear == true) {
                            camp.cleared = true;
                            result_1.success.data.isClear = true;
                        }
                        break;
                    }
                }
                // ????????? ???????????? ????????? ??????
                let rankingDB = new RankingManager_1.default(this.req, this.res);
                const rankInsert = () => __awaiter(this, void 0, void 0, function* () { rankingDB.insert(''); });
                rankInsert().then(() => { rankingDB.update(''); });
                let coupon = []; // ????????? ????????? ?????? ??????
                if (isCampClear == true && campcoupon.length != 0) { //????????? ??????????????? ????????? ????????? ?????? ?????? ????????? ?????? ??????
                    coupon.push({
                        id: campcoupon[0],
                        used: false
                    });
                }
                if (coupons.length != 0) { // ???????????? ????????? ?????? ?????? ???????????? ?????? ??????
                    coupon.push({
                        id: coupons[0],
                        used: false
                    });
                }
                this.res.locals.coupon = []; // ??????????????? ????????? ?????? ??????
                this.res.locals.coupon2insert = []; // ????????? ??????
                for (const coup of coupon) { // ?????? ?????? ??????
                    this.res.locals.coupon.push(coup);
                }
                this.res.locals.playingCampaigns = playingCampaigns;
                if (coupon.length != 0) { // ????????? ????????? ???????????? ??????
                    for (const coup of coupon) { // ?????? ????????? ??????, limit??? ???????????? ????????? ????????? ????????? ??????
                        couponParams.Key = { id: coup.id };
                        this.res.locals.coupon.shift();
                        yield this.Dynamodb.update(couponParams).promise(); // limit??? ?????? ?????? ?????????????????? ?????? ?????? ??????
                        this.res.locals.coupon2insert.push(coup);
                    }
                }
                updateParams.ExpressionAttributeValues[":newPlaying"] = playingCampaigns;
                updateParams.ExpressionAttributeValues[":newcoupon"] = this.res.locals.coupon2insert;
                for (const coup of this.res.locals.coupon2insert) { // batchGet parameter??? ????????? ?????? ?????????
                    let obj = {
                        id: coup.id
                    };
                    batchCoupon.RequestItems.Coupon.Keys.push(obj);
                }
                if (batchCoupon.RequestItems.Coupon.Keys.length == 0) {
                    yield this.Dynamodb.update(updateParams).promise();
                    result_1.success.data.coupons = [];
                    this.res.status(201).send(result_1.success);
                    responseInit_1.successInit(result_1.success);
                    return;
                }
                let getCoupon = yield this.Dynamodb.batchGet(batchCoupon).promise();
                let getCoupons = getCoupon.Responses.Coupon;
                let answer = []; // ????????? ?????? ?????? ????????? ?????? ??????
                for (const coupon of getCoupons) { // ????????? ????????? object??? ????????? answer??? push
                    let obj = {
                        name: coupon.name,
                        goods: coupon.goods,
                        imgs: coupon.imgs
                    };
                    answer.push(obj);
                }
                yield this.Dynamodb.update(updateParams).promise();
                result_1.success.data.coupons = answer;
                this.res.status(201).send(result_1.success);
                responseInit_1.successInit(result_1.success);
            }
            catch (err) {
                console.log(err);
                if (err.code != 'ConditionalCheckFailedException') { // ?????? ?????? ?????? ?????? ????????? ?????? ??????
                    result_1.fail.error = result_1.error.dbError;
                    result_1.fail.errdesc = err;
                    this.res.status(521).send(result_1.fail);
                    responseInit_1.successInit(result_1.success);
                    return;
                }
                if (this.res.locals.coupon.length == 0) { // ????????? ????????? ????????? ?????? ??????
                    updateParams.ExpressionAttributeValues[":newPlaying"] = this.res.locals.playingCampaigns;
                    updateParams.ExpressionAttributeValues[":newcoupon"] = this.res.locals.coupon2insert;
                    for (const coup of this.res.locals.coupon2insert) { // batchGet??? ?????? parameter ?????? ?????????
                        let obj = {
                            id: coup.id
                        };
                        batchCoupon.RequestItems.Coupon.Keys.push(obj);
                    }
                    let getCoupon = yield this.Dynamodb.batchGet(batchCoupon).promise();
                    let getCoupons = getCoupon.Responses.Coupon;
                    let answer = [];
                    for (const coupon of getCoupons) { //?????? object??? ???????????? answer??? push
                        let obj = {
                            name: coupon.name,
                            goods: coupon.goods,
                            imgs: coupon.imgs
                        };
                        answer.push(obj);
                    }
                    yield this.Dynamodb.update(updateParams).promise();
                    result_1.success.data.coupons = answer;
                    this.res.status(201).send(result_1.success);
                    responseInit_1.successInit(result_1.success);
                    return;
                }
                else { // ????????? ????????? ???????????? ??????
                    try {
                        couponParams.Key = { id: this.res.locals.coupon[0].id }; // ?????? ????????? ?????? parameter ??????
                        this.Dynamodb.update(couponParams, function (err, data) {
                            return __awaiter(this, void 0, void 0, function* () {
                                if (err) { // ?????? ????????? ????????? ??????( ?????? ?????? ?????? )
                                    updateParams.ExpressionAttributeValues[":newPlaying"] = this.res.locals.playingCampaigns;
                                    updateParams.ExpressionAttributeValues[":newcoupon"] = this.res.locals.coupon2insert;
                                    for (const coup of this.res.locals.coupon2insert) {
                                        let obj = {
                                            id: coup.id
                                        };
                                        batchCoupon.RequestItems.Coupon.Keys.push(obj);
                                    }
                                    let getCoupon = yield this.Dynamodb.batchGet(batchCoupon).promise();
                                    let getCoupons = getCoupon.Responses.Coupon;
                                    let answer = [];
                                    for (const coupon of getCoupons) {
                                        let obj = {
                                            name: coupon.name,
                                            goods: coupon.goods,
                                            imgs: coupon.imgs
                                        };
                                        answer.push(obj);
                                    }
                                    yield this.Dynamodb.update(updateParams).promise();
                                    result_1.success.data.coupons = answer;
                                    this.res.status(201).send(result_1.success);
                                    responseInit_1.successInit(result_1.success);
                                    return;
                                }
                                else { // ?????? ?????? ??????
                                    this.res.locals.coupon2insert.push(this.res.locals.coupon[0]);
                                    updateParams.ExpressionAttributeValues[":newPlaying"] = this.res.locals.playingCampaigns;
                                    updateParams.ExpressionAttributeValues[":newcoupon"] = this.res.locals.coupon2insert;
                                    for (const coup of this.res.locals.coupon2insert) {
                                        let obj = {
                                            id: coup.id
                                        };
                                        batchCoupon.RequestItems.Coupon.Keys.push(obj);
                                    }
                                    let getCoupon = yield this.Dynamodb.batchGet(batchCoupon).promise();
                                    let getCoupons = getCoupon.Responses.Coupon;
                                    let answer = [];
                                    for (const coupon of getCoupons) {
                                        let obj = {
                                            name: coupon.name,
                                            goods: coupon.goods,
                                            imgs: coupon.imgs
                                        };
                                        answer.push(obj);
                                    }
                                    yield this.Dynamodb.update(updateParams).promise();
                                    result_1.success.data.coupons = answer;
                                    this.res.status(201).send(result_1.success);
                                    responseInit_1.successInit(result_1.success);
                                    return;
                                }
                            });
                        }.bind(this));
                    }
                    catch (err) {
                        console.log(err); // ????????? ????????? ?????? ??????
                        updateParams.ExpressionAttributeValues[":newPlaying"] = this.res.locals.playingCampaigns;
                        updateParams.ExpressionAttributeValues[":newcoupon"] = [];
                        for (const coup of this.res.locals.coupon2insert) {
                            let obj = {
                                id: coup.id
                            };
                            batchCoupon.RequestItems.Coupon.Keys.push(obj);
                        }
                        let getCoupon = yield this.Dynamodb.batchGet(batchCoupon).promise();
                        let getCoupons = getCoupon.Responses.Coupon;
                        let answer = [];
                        for (const coupon of getCoupons) {
                            let obj = {
                                name: coupon.name,
                                goods: coupon.goods,
                                imgs: coupon.imgs
                            };
                            answer.push(obj);
                        }
                        yield this.Dynamodb.update(updateParams).promise();
                        result_1.success.data.coupons = answer;
                        this.res.status(201).send(result_1.success);
                        responseInit_1.successInit(result_1.success);
                        return;
                    }
                }
            }
        });
        run();
    }
    checkQuiz(params) {
        let memberParam = {
            TableName: 'Member',
            KeyConditionExpression: 'id = :id',
            ExpressionAttributeValues: { ':id': this.req.session.passport.user.id }
        };
        const run = () => __awaiter(this, void 0, void 0, function* () {
            params.pid = nbsp_1.nbsp2plus(params.pid);
            params.caid = nbsp_1.nbsp2plus(params.caid);
            console.log('????????? ????????? ?????? ???????????????');
            let memberResult = yield this.Dynamodb.query(memberParam).promise(); // ???????????? ????????? ?????? ????????????
            let playing = memberResult.Items[0].playingCampaigns;
            console.log(`???????????? ??????${JSON.stringify(playing, null, 2)}`);
            console.log('???????????? ???????????? ?????? ?????????');
            for (let i = 0; i < playing.length; i++) { // ???????????? ???????????? ??????
                if (playing[i].id == params.caid) { // ?????? ???????????? ???????????? ??????
                    for (const id of playing[i].pinpoints) { // ?????? ???????????? ???????????? ???????????? ????????? ??????
                        if (id == params.pid) { // ???????????? ??????????????? ??????
                            console.log('???????????? ????????????!');
                            result_1.fail.error = result_1.error.invalReq;
                            result_1.fail.errdesc = '?????? ???????????? ?????????????????????.';
                            this.res.status(400).send(result_1.fail);
                            return;
                        }
                    }
                    break;
                }
                if (i == playing.length - 1) {
                    console.log('???????????? ????????? ??????!');
                    result_1.fail.error = result_1.error.invalReq;
                    result_1.fail.errdesc = '???????????? ???????????? ????????????.';
                    this.res.status(400).send(result_1.fail);
                    return;
                }
            }
            console.log('????????? ?????? ??????. ??????????????? ?????? ?????????????????????.');
            let failedQuiz = this.req.session.passport.user.quiz;
            console.log(`?????? ???????????? ?????????\n${JSON.stringify(failedQuiz, null, 2)}`);
            params.pid = nbsp_1.nbsp2plus(params.pid);
            if (failedQuiz.length != 0) { // ????????? ??????????????? ?????? ??????
                for (const quiz of failedQuiz) { // ????????? ??????????????? ??????
                    if (quiz.id == params.pid) { // ?????? ??????????????? ?????? ??????
                        let currTime = new Date(Date.now() + 9 * 60 * 60 * 1000).getTime();
                        let limitTime = new Date(quiz.time).getTime();
                        if ((currTime - limitTime) < 180000) { // ?????? ??????????????? ????????? ??????
                            console.log('?????? ?????? ????????????');
                            let diff = 180000 - (currTime - limitTime);
                            let min = Math.floor(diff / 1000 / 60);
                            let sec = Math.floor(diff / 1000) % 60;
                            result_1.fail.error = result_1.error.invalReq;
                            result_1.fail.errdesc = `?????? ?????? ??????????????? ${min}??? ${sec}??? ????????????.`;
                            this.res.status(400).send(result_1.fail);
                            return;
                        }
                        else {
                            quiz.time = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString();
                        }
                    }
                }
            }
            this.req.session.passport.user.quiz.push({
                id: params.pid,
                time: new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString()
            });
            result_1.success.data = "?????? ????????? ????????????.";
            this.res.status(200).send(result_1.success);
        });
        run();
    }
    /**
     * ???????????? ?????? API
     */
    /**
     * ???????????? ?????? ?????? API
     * 1. ????????? id??? ????????? ????????? id ??????
     * 2. ???????????? id + ???????????? ?????? id ??????
     * 3. rated = 0?????? ??????
     * 4. DB ?????? ??? ?????? ??????
     */
    insertComment(params) {
        let userid = this.req.session.passport.user.id;
        let date = new Date(Date.now() + 9 * 60 * 60 * 1000);
        let hash = CryptoJS.SHA256(params.pid + date.toString()); //id ??????
        params.coid = hash.toString(CryptoJS.enc.Base64);
        if (userid != params.comments.userId) { //????????? id??? ????????? id??? ?????? ??????
            result_1.fail.error = result_1.error.invalKey;
            result_1.fail.errdesc = 'User Id does not match with session';
            this.res.status(400).send(result_1.fail);
            return;
        }
        let memberParams = {
            TableName: 'Member',
            KeyConditionExpression: 'id = :id',
            ExpressionAttributeValues: { ':id': userid },
            ProjectionExpression: 'profileImg, nickname'
        };
        let comment = [{
                id: params.coid,
                userId: userid,
                text: params.comments.text,
                rated: 0,
                imgs: params.imgs,
                nickname: null,
                profileImg: null,
                updateTime: date.toISOString(),
                rateList: []
            }];
        let queryParams = {
            TableName: 'Pinpoint',
            Key: { id: params.pid },
            UpdateExpression: 'set comments = list_append(if_not_exists(comments, :emptylist), :newcomment)',
            ExpressionAttributeValues: { ':newcomment': comment, ':emptylist': [] },
            ReturnValues: 'UPDATED_NEW',
            ConditionExpression: "attribute_exists(id)"
        };
        const run = () => __awaiter(this, void 0, void 0, function* () {
            try {
                let userResult = yield this.Dynamodb.query(memberParams).promise();
                let user = userResult.Items[0];
                comment[0].nickname = user.nickname;
                comment[0].profileImg = user.profileImg;
                console.log(comment[0]);
                let queryResult = yield this.Dynamodb.update(queryParams).promise();
                result_1.success.data = comment[0];
                this.res.status(200).send(result_1.success);
                responseInit_1.successInit(result_1.success);
            }
            catch (err) {
                console.log(err);
                result_1.fail.error = result_1.error.dbError;
                result_1.fail.errdesc = err;
                this.res.status(400).send(result_1.fail);
            }
        });
        run();
    }
    readComment(params) {
        let id = nbsp_1.nbsp2plus(params.pid);
        let queryParams = {
            TableName: 'Pinpoint',
            KeyConditionExpression: 'id = :id',
            ProjectionExpression: 'comments',
            ExpressionAttributeValues: { ':id': id }
        };
        const run = () => __awaiter(this, void 0, void 0, function* () {
            try {
                let result = yield this.Dynamodb.query(queryParams).promise();
                if (result.Items[0] == undefined) {
                    result_1.fail.error = result_1.error.invalKey;
                    result_1.fail.errdesc = '??????????????? ?????? ??? ????????????.';
                    this.res.status(400).send(result_1.fail);
                    return;
                }
                result_1.success.data = result.Items[0].comments;
                this.res.status(200).send(result_1.success);
                responseInit_1.successInit(result_1.success);
            }
            catch (err) {
                console.log(err);
                result_1.fail.error = result_1.error.dbError;
                result_1.fail.errdesc = err;
                this.res.status(400).send(result_1.fail);
            }
        });
        run();
    }
    /**
     * ???????????? ?????? ?????? ??????
     * 1. ???????????? id??? ????????? ????????? ?????????
     * 2. for?????? ?????? ?????? id??? ???????????? ????????? ??????
     * 3. ?????? ????????? ??????
     */
    deleteComment(params) {
        let uid = this.req.session.passport.user.id;
        if (uid != params.uid) {
            result_1.fail.error = result_1.error.invalAcc;
            result_1.fail.errdesc = "Given id does not match with session info";
            this.res.status(403).send(result_1.fail);
            return;
        }
        let pid = params.pid;
        let findParams = {
            TableName: 'Pinpoint',
            KeyConditionExpression: 'id = :id',
            ProjectionExpression: 'comments',
            ExpressionAttributeValues: { ':id': pid }
        };
        let updateParams = {
            TableName: 'Pinpoint',
            Key: { id: params.pid },
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
                    result_1.fail.errdesc = "??????????????? ?????? ??? ????????????.";
                    this.res.status(400).send(result_1.fail);
                    return;
                }
                for (let i = 0; i < comments.Items[0].comments.length; i++) {
                    let cid = comments.Items[0].comments[i].id;
                    let uid = comments.Items[0].comments[i].userId;
                    if (cid == params.coid && uid == params.uid) {
                        comments.Items[0].comments.splice(i, 1);
                        break;
                    }
                    if (i == comments.Items[0].comments.length - 1) {
                        result_1.fail.error = result_1.error.invalKey;
                        result_1.fail.errdesc = 'Cannot find comment';
                        this.res.status(403).send(result_1.fail);
                        return;
                    }
                }
                console.log('?????? ?????????...');
                console.log(comments.Items[0].comments);
                updateParams.ExpressionAttributeValues[":newcomment"] = comments.Items[0].comments;
                let updateResult = yield this.Dynamodb.update(updateParams).promise();
                result_1.success.data = updateResult.Attributes.comments;
                this.res.status(200).send(result_1.success);
                responseInit_1.successInit(result_1.success);
            }
            catch (err) {
                console.log(err);
                result_1.fail.error = result_1.error.dbError;
                result_1.fail.errdesc = err;
                this.res.status(400).send(result_1.fail);
            }
        });
        run();
    }
    updateComment(params) {
        let pid = params.pid;
        let findParams = {
            TableName: 'Pinpoint',
            KeyConditionExpression: 'id = :id',
            ProjectionExpression: 'comments',
            ExpressionAttributeValues: { ':id': pid }
        };
        let updateParams = {
            TableName: 'Pinpoint',
            Key: { id: params.pid },
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
                    result_1.fail.errdesc = "Given id does not match with session info";
                    this.res.status(403).send(result_1.fail);
                    return;
                }
                let comments = yield this.Dynamodb.query(findParams).promise();
                if (comments.Items[0] == undefined) {
                    result_1.fail.error = result_1.error.dataNotFound;
                    result_1.fail.errdesc = "Cannot find Pinpoint";
                    this.res.status(403).send(result_1.fail);
                    return;
                }
                console.log('?????? ?????????...');
                for (let i = 0; i < comments.Items[0].comments.length; i++) {
                    let cid = comments.Items[0].comments[i].id;
                    let uid = comments.Items[0].comments[i].userId;
                    if (cid == params.coid && uid == params.uid) {
                        console.log('?????? ??????');
                        if (comments.Items[0].comments[i].text == '?????????????????? ?????????????????????.') {
                            result_1.fail.error = result_1.error.invalReq;
                            result_1.fail.errdesc = '????????? ???????????????.';
                            this.res.status(400).send(result_1.fail);
                            return;
                        }
                        comments.Items[0].comments[i].text = params.text;
                        comments.Items[0].comments[i].time = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString();
                        result_1.success.data = comments.Items[0].comments[i];
                        break;
                    }
                    if (i == comments.Items[0].comments.length - 1) {
                        result_1.fail.error = result_1.error.dataNotFound;
                        result_1.fail.errdesc = "Cannot find Comment";
                        this.res.status(403).send(result_1.fail);
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
                console.log(err);
                result_1.fail.error = result_1.error.dbError;
                result_1.fail.errdesc = err;
                this.res.status(400).send(result_1.fail);
            }
        });
        run();
    }
    updateRate(params) {
        if (params.uid != this.req.session.passport.user.id) {
            result_1.fail.error = result_1.error.invalAcc;
            result_1.fail.errdesc = '?????? ????????? id??? ???????????? ????????????.';
            this.res.status(400).send(result_1.fail);
            return;
        }
        let pid = params.pid;
        let findParams = {
            TableName: 'Pinpoint',
            KeyConditionExpression: 'id = :id',
            ProjectionExpression: 'comments',
            ExpressionAttributeValues: { ':id': pid }
        };
        let updateParams = {
            TableName: 'Pinpoint',
            Key: { id: params.pid },
            UpdateExpression: 'set comments = :newcomment',
            ExpressionAttributeValues: { ':newcomment': null },
            ReturnValues: 'UPDATED_NEW',
            ConditionExpression: "attribute_exists(id)"
        };
        const run = () => __awaiter(this, void 0, void 0, function* () {
            try {
                let isNewComment = true;
                let comments = yield this.Dynamodb.query(findParams).promise();
                if (comments.Items[0] == undefined) {
                    result_1.fail.error = result_1.error.dataNotFound;
                    result_1.fail.errdesc = "Cannot find pinpoint";
                    this.res.status(403).send(result_1.fail);
                    return;
                }
                console.log('?????? ?????????...');
                for (let i = 0; i < comments.Items[0].comments.length; i++) {
                    let coid = comments.Items[0].comments[i].id;
                    if (coid == params.coid) {
                        console.log('?????? ??????');
                        if (comments.Items[0].comments[i].rateList == undefined) {
                            comments.Items[0].comments[i].rateList = [];
                        }
                        for (const user of comments.Items[0].comments[i].rateList) {
                            if (user.id == params.uid) {
                                isNewComment = false;
                                if (user.like == params.like) {
                                    result_1.fail.error = result_1.error.invalReq;
                                    result_1.fail.errdesc = '?????? ????????? / ???????????? ??????????????????.';
                                    this.res.status(400).send(result_1.fail);
                                    return;
                                }
                                break;
                            }
                        }
                        if (isNewComment == true) {
                            if (params.like == true) {
                                comments.Items[0].comments[i].rated += 1;
                                console.log(comments.Items[0].comments[i]);
                                comments.Items[0].comments[i].rateList.push({ id: params.uid, like: true });
                                result_1.success.data = comments.Items[0].comments[i];
                                break;
                            }
                            else {
                                comments.Items[0].comments[i].rated -= 1;
                                comments.Items[0].comments[i].rateList.push({ id: params.uid, like: false });
                                result_1.success.data = comments.Items[0].comments[i];
                                break;
                            }
                        }
                        else {
                            if (params.like == true) {
                                comments.Items[0].comments[i].rated += 1;
                                console.log(comments.Items[0].comments[i]);
                                for (const rate of comments.Items[0].comments[i].rateList) {
                                    if (rate.id = params.uid) {
                                        rate.like = true;
                                    }
                                }
                                result_1.success.data = comments.Items[0].comments[i];
                                break;
                            }
                            else {
                                comments.Items[0].comments[i].rated -= 1;
                                for (const rate of comments.Items[0].comments[i].rateList) {
                                    if (rate.id = params.uid) {
                                        rate.like = false;
                                    }
                                }
                                result_1.success.data = comments.Items[0].comments[i];
                                break;
                            }
                        }
                    }
                    if (i == comments.Items[0].comments.length - 1) {
                        result_1.fail.error = result_1.error.dataNotFound;
                        result_1.fail.errdesc = "Cannot find Comment";
                        this.res.status(403).send(result_1.fail);
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
                console.log(err);
                result_1.fail.error = result_1.error.dbError;
                result_1.fail.errdesc = err;
                this.res.status(400).send(result_1.fail);
            }
        });
        run();
    }
}
exports.default = PinpointManager;
