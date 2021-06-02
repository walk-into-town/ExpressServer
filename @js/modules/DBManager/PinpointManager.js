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
     * 핀포인트 등록 로직
     * 1. 핀포인트 이름, 위/경도로 hash id 생성
     * 2. 해당 id를 이용해 DB Insert
     * 3. ConditionExpression을 통해 id가 중복되면 실패
     */
    insert(params) {
        let date = new Date(Date.now() + 9 * 60 * 60 * 1000);
        let hash = CryptoJS.SHA256(params.name + params.latitude.toString() + params.longitude.toString() + date.toString()); //id 생성
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
            ConditionExpression: "attribute_not_exists(id)" // 항목 추가하기 전에 이미 존재하는 항목이 있을 경우 pk가 있을 때 조건 실패. pk는 반드시 있어야 하므로 replace를 방지
        };
        const run = () => __awaiter(this, void 0, void 0, function* () {
            try {
                if (params.coupons != undefined) { // 핀포인트 쿠폰이 있는경우 쿠폰 유효성 파악                
                    let checkCoupon = yield this.Dynamodb.query(checkCouponParams).promise();
                    if (checkCoupon.Items[0] == undefined) { //data.Item == undefined -> 해당하는 ID가 없음
                        console.log(`핀포인트 쿠폰 체크\nDB 요청 Params\n${JSON.stringify(queryParams, null, 2)}`);
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
                console.log(`응답 JSON\n${JSON.stringify(result_1.success, null, 2)}`);
            }
            catch (err) {
                result_1.fail.error = result_1.error.dbError;
                result_1.fail.errdesc = err;
                this.res.status(400).send(result_1.fail);
            }
        });
        run();
    }
    /**
     * 핀포인트 조회 로직
     * batchGet을 사용 -> 핀포인트 목록조회와 일반 조회 모두 같은 함수로 통일
     * 1. batchget을 통해 DB에서 핀포인트를 가져옴
     * 2. 사용자에게 전달
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
                let test = yield this.Dynamodb.batchGet(queryParams, this.onRead.bind(this)).promise(); // read를 수행할때 까지 대기
                if (this.res.locals.UnprocessedKeys != undefined) { //오류 발생 처리
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
            console.log('핀포인트 목록 가져오는중...');
            let queryResult = yield this.Dynamodb.query(queryParams).promise();
            let pinpointList = [];
            if (queryResult.Items[0] == undefined) {
                result_1.fail.error = result_1.error.invalKey;
                result_1.fail.errdesc = '캠페인을 찾을 수 없습니다.';
                this.res.status(400).send(result_1.fail);
                return;
            }
            console.log(`핀포인트 id\n${JSON.stringify(queryResult.Items[0].pinpoints)}`);
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
     * 핀포인트 수정 로직
     * 1. 핀포인트 update수행
     * 2. 성공 /실패 메시지 전달
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
     * 핀포인트 삭제 로직
     * 1. 사용자 입력 값으로 핀포인트 삭제
     * 2. ReturnValues를 통해 삭제 전 항목을 받아
     * 3. 사용자에게 전달
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
     * 핀포인트 상세 정보 API
     */
    /**
     * 핀포인트 상세 조회 로직
     * 1. 사용자로부터 입력받은 값으로 get 수행
     * 2. ProjectionExpression을 통해 상세 설명만 가져옴
     * 3. 사용자에게 전달
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
     * 핀포인트 상세정보 수정 로직
     * 1. 사용자로부터 값 받기
     * 2. ConditionExpression을 통해 이미 존재하는 핀포인트에 대해서만 수행
     *    => DynamoDB에서는 일치하는 Key가 없는 경우 자동으로 Insert
     * 3. 사용자에게 결과 전달
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
     * 핀포인트 퀴즈 API
     */
    /**
     * 퀴즈 등록 로직
     * 1. 사용자로부터 값 받음
     * 2. RetrunValues를 통해 생성된 값 + ConditionExpression을 통해 없는 항목에만 등록
     * 3. 사용자에게 결과 전달
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
     * 퀴즈 조회 로직
     * 1. 사용자로부터 값 수신
     * 2. ProjectionExpression을 통해 퀴즈만 가져옴
     * 3. 사용자에게 전달
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
            if (quiz.type == '주관식') {
                delete quiz.choices;
            }
            result_1.success.data = quiz;
            this.res.status(201).send(result_1.success);
            responseInit_1.successInit(result_1.success);
        }
    }
    /**
     * 퀴즈 수정 로직
     * 1. 사용자로부터 값 수신
     * 2. ReturnValues를 통해 새로 생성된 항목 받기
     * 3. ConditionExpression을 통해 이미 존재하는 항목만 수정
     * 4. 사용자에게 결과 전달
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
     * 퀴즈풀기 로직
     * 1. 참여중인 캠페인 조회
     * 2. 클리어한 캠페인 / 핀포인트인 경우 에러
     * 3. 정답 확인
     * 4. 정답인 경우
     */
    solveQuiz(params) {
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
            UpdateExpression: 'set coupons = list_append(if_not_exists(coupons, :emptylist), :newcoupon), playingCampaigns = :newPlaying',
            ExpressionAttributeValues: { ':emptylist': [], ':newcoupon': null, ':newPlaying': null },
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
                let isCampClear = false; //캠페인 클리어 여부. true인 경우 캠페인의 쿠폰 발급 + 캠페인 클리어 표시. default는 false
                result_1.success.data = {};
                result_1.success.data.isClear = false;
                console.log('참여중 캠페인 조회중');
                let memberResult = yield this.Dynamodb.query(memberparams).promise();
                let playingCampaigns = memberResult.Items[0].playingCampaigns;
                console.log(`참여중 캠페인 조회 성공\n${JSON.stringify(playingCampaigns, null, 2)}`);
                console.log('핀포인트 클리어 여부 확인중');
                let campResult = yield this.Dynamodb.query(campParams).promise();
                let pinpoints = campResult.Items[0].pinpoints;
                let campcoupon = campResult.Items[0].coupons;
                for (const camp of playingCampaigns) { // 참여중 캠페인 목록에서
                    if (camp.id == params.caid) { // 이미 참여중인 캠페인
                        if (camp.cleared == true) { // 이미 클리어한 캠페인인 경우
                            result_1.fail.error = result_1.error.invalReq;
                            result_1.fail.errdesc = '이미 클리어한 캠페인입니다.';
                            this.res.status(400).send(result_1.fail);
                            responseInit_1.successInit(result_1.success);
                            return;
                        }
                        for (const id of camp.pinpoints) { // 클리어 하지 않은 경우 핀포인트 클리어 여부 체크
                            if (id == params.pid) {
                                console.log('이미 클리어한 핀포인트입니다.');
                                result_1.fail.error = result_1.error.invalReq;
                                result_1.fail.errdesc = '이미 클리어한 핀포인트입니다.';
                                this.res.status(400).send(result_1.fail);
                                responseInit_1.successInit(result_1.success);
                                return;
                            }
                        }
                        if (pinpoints.length - 1 == camp.pinpoints.length) { // 이 핀포인트 클리어 = 캠페인 클리어인 경우
                            isCampClear = true;
                        }
                        break;
                    }
                }
                console.log('핀포인트 클리어 여부 확인 완료');
                console.log('핀포인트 정보 조회중');
                let result = yield this.Dynamodb.query(queryParams).promise();
                let quiz = result.Items[0].quiz;
                let coupons = result.Items[0].coupons;
                console.log(`핀포인트 조회 성공\n${JSON.stringify(result.Items[0], null, 2)}`);
                if (quiz.answer != params.answer) { //정답이 아닌 경우 틀림 메시지 전달 후 종료
                    result_1.fail.error = result_1.error.invalKey;
                    result_1.fail.errdesc = '틀렸습니다.';
                    this.res.status(400).send(result_1.fail);
                    responseInit_1.successInit(result_1.success);
                    return;
                }
                // 캠페인 클리어인 경우 cleared를 true로
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
                // 랭킹에 핀포인트 클리어 적용
                let rankingDB = new RankingManager_1.default(this.req, this.res);
                const rankInsert = () => __awaiter(this, void 0, void 0, function* () { rankingDB.insert(''); });
                rankInsert().then(() => { rankingDB.update(''); });
                let coupon = []; // 등록된 쿠폰을 담는 배열
                if (isCampClear == true && campcoupon.length != 0) { //캠페인 클리어이며 캠페인 쿠폰이 있는 경우 캠페인 쿠폰 등록
                    coupon.push({
                        id: campcoupon[0],
                        used: false
                    });
                }
                if (coupons.length != 0) { // 핀포인트 쿠폰이 있는 경우 핀포인트 쿠폰 등록
                    coupon.push({
                        id: coupons[0],
                        used: false
                    });
                }
                this.res.locals.coupon = []; // 발급해야할 쿠폰을 담는 배열
                this.res.locals.coupon2insert = []; // 발급된 쿠폰
                for (const coup of coupon) { // 배열 깊은 복사
                    this.res.locals.coupon.push(coup);
                }
                this.res.locals.playingCampaigns = playingCampaigns;
                if (coupon.length != 0) { // 등록된 쿠폰이 존재하는 경우
                    for (const coup of coupon) { // 쿠폰 발급을 진행, limit를 초과하지 않으면 발급된 쿠폰에 추가
                        couponParams.Key = { id: coup.id };
                        this.res.locals.coupon.shift();
                        yield this.Dynamodb.update(couponParams).promise(); // limit를 넘긴 경우 예외처리에서 남은 쿠폰 처리
                        this.res.locals.coupon2insert.push(coup);
                    }
                }
                updateParams.ExpressionAttributeValues[":newPlaying"] = playingCampaigns;
                updateParams.ExpressionAttributeValues[":newcoupon"] = this.res.locals.coupon2insert;
                for (const coup of this.res.locals.coupon2insert) { // batchGet parameter를 만들기 위한 반복문
                    let obj = {
                        id: coup.id
                    };
                    batchCoupon.RequestItems.Coupon.Keys.push(obj);
                }
                let getCoupon = yield this.Dynamodb.batchGet(batchCoupon).promise();
                let getCoupons = getCoupon.Responses.Coupon;
                let answer = []; // 응답에 쓰일 쿠폰 정보를 담는 배열
                for (const coupon of getCoupons) { // 필요한 정보를 object로 만들어 answer에 push
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
                if (err.code != 'ConditionalCheckFailedException') { // 쿠폰 발급 개수 초과 에러가 아닌 경우
                    result_1.fail.error = result_1.error.dbError;
                    result_1.fail.errdesc = err;
                    this.res.status(521).send(result_1.fail);
                    responseInit_1.successInit(result_1.success);
                    return;
                }
                if (this.res.locals.coupon.length == 0) { // 발급할 쿠폰이 더이상 없는 경우
                    updateParams.ExpressionAttributeValues[":newPlaying"] = this.res.locals.playingCampaigns;
                    updateParams.ExpressionAttributeValues[":newcoupon"] = this.res.locals.coupon2insert;
                    for (const coup of this.res.locals.coupon2insert) { // batchGet을 위한 parameter 작성 반복문
                        let obj = {
                            id: coup.id
                        };
                        batchCoupon.RequestItems.Coupon.Keys.push(obj);
                    }
                    let getCoupon = yield this.Dynamodb.batchGet(batchCoupon).promise();
                    let getCoupons = getCoupon.Responses.Coupon;
                    let answer = [];
                    for (const coupon of getCoupons) { //쿠폰 object를 생성하고 answer에 push
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
                else { // 등록할 쿠폰이 남아있는 경우
                    try {
                        couponParams.Key = { id: this.res.locals.coupon[0].id }; // 쿠폰 발급을 위한 parameter 생성
                        this.Dynamodb.update(couponParams, function (err, data) {
                            return __awaiter(this, void 0, void 0, function* () {
                                if (err) { // 쿠폰 발급에 실패한 경우( 쿠폰 제한 초과 )
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
                                else { // 쿠폰 발급 성공
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
                    catch (err) { // 발급할 쿠폰이 없는 경우
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
    /**
     * 핀포인트 댓글 API
     */
    /**
     * 핀포인트 댓글 등록 API
     * 1. 사용자 id와 세션에 저장된 id 확인
     * 2. 핀포인트 id + 시간으로 댓글 id 생성
     * 3. rated = 0으로 설정
     * 4. DB 등록 후 결과 반환
     */
    insertComment(params) {
        let userid = this.req.session.passport.user.id;
        let date = new Date(Date.now() + 9 * 60 * 60 * 1000);
        let hash = CryptoJS.SHA256(params.pid + date.toString()); //id 생성
        params.coid = hash.toString(CryptoJS.enc.Base64);
        if (userid != params.comments.userId) { //세션의 id와 전송한 id가 다른 경우
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
                    result_1.fail.errdesc = '핀포인트를 찾을 수 없습니다.';
                    this.res.status(400).send(result_1.fail);
                    return;
                }
                result_1.success.data = result.Items[0].comments;
                this.res.status(200).send(result_1.success);
                responseInit_1.successInit(result_1.success);
            }
            catch (err) {
                result_1.fail.error = result_1.error.dbError;
                result_1.fail.errdesc = err;
                this.res.status(400).send(result_1.fail);
            }
        });
        run();
    }
    /**
     * 핀포인트 댓글 삭제 로직
     * 1. 핀포인트 id를 이용해 댓글을 가져옴
     * 2. for문을 돌며 댓글 id가 일치하는 항목을 삭제
     * 3. 성공 메시지 출력
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
                    result_1.fail.errdesc = "핀포인트를 찾을 수 없습니다.";
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
                console.log('댓글 찾는중...');
                console.log(comments.Items[0].comments);
                updateParams.ExpressionAttributeValues[":newcomment"] = comments.Items[0].comments;
                let updateResult = yield this.Dynamodb.update(updateParams).promise();
                result_1.success.data = updateResult.Attributes.comments;
                this.res.status(200).send(result_1.success);
                responseInit_1.successInit(result_1.success);
            }
            catch (err) {
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
                console.log('댓글 찾는중...');
                for (let i = 0; i < comments.Items[0].comments.length; i++) {
                    let cid = comments.Items[0].comments[i].id;
                    let uid = comments.Items[0].comments[i].userId;
                    if (cid == params.coid && uid == params.uid) {
                        console.log('조건 만족');
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
                console.log('댓글 수정중...');
                let updateResult = yield this.Dynamodb.update(updateParams).promise();
                this.res.status(200).send(result_1.success);
                responseInit_1.successInit(result_1.success);
            }
            catch (err) {
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
            result_1.fail.errdesc = '세션 정보와 id가 일치하지 않습니다.';
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
                console.log('댓글 찾는중...');
                for (let i = 0; i < comments.Items[0].comments.length; i++) {
                    let coid = comments.Items[0].comments[i].id;
                    if (coid == params.coid) {
                        console.log('조건 만족');
                        if (comments.Items[0].comments[i].rateList == undefined) {
                            comments.Items[0].comments[i].rateList = [];
                        }
                        for (const user of comments.Items[0].comments[i].rateList) {
                            if (user.id == params.uid) {
                                isNewComment = false;
                                if (user.like == params.like) {
                                    result_1.fail.error = result_1.error.invalReq;
                                    result_1.fail.errdesc = '이미 좋아요 / 싫어요를 누르셨습니다.';
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
                console.log('댓글 수정중...');
                let updateResult = yield this.Dynamodb.update(updateParams).promise();
                this.res.status(200).send(result_1.success);
                responseInit_1.successInit(result_1.success);
            }
            catch (err) {
                result_1.fail.error = result_1.error.dbError;
                result_1.fail.errdesc = err;
                this.res.status(400).send(result_1.fail);
            }
        });
        run();
    }
}
exports.default = PinpointManager;
