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
const bcrypt = __importStar(require("bcrypt"));
const result_1 = require("../../static/result");
const nbsp_1 = require("../Logics/nbsp");
const responseInit_1 = require("../Logics/responseInit");
class MemberManager extends FeatureManager_1.FeatureManager {
    /**
     * 회원가입 로직
     * 1. 입력한 pw를 bcrypt를 이용해 DB에 저장할 pw 생성
     * 2. 생성된 pw를 이용해 DB에 Insert
     * 3. ConditionExpression을 통해 id가 중복되는 경우 실패
     */
    insert(params) {
        let pw;
        let saltRounds = 10;
        const run = () => __awaiter(this, void 0, void 0, function* () {
            try {
                if (params.nickname == '(일수없음)') {
                    result_1.fail.error = result_1.error.invalReq;
                    result_1.fail.errdesc = '잘못된 닉네임입니다.';
                    this.res.status(400).send(result_1.fail);
                    return;
                }
                let nicknameCheckparams = {
                    TableName: 'Member',
                    IndexName: 'nicknameIndex',
                    KeyConditionExpression: 'nickname = :value',
                    ExpressionAttributeValues: { ':value': params.nickname },
                };
                let nicknameCheckResult = yield this.Dynamodb.query(nicknameCheckparams).promise();
                console.log(nicknameCheckResult.Items);
                if (nicknameCheckResult.Items.length != 0) {
                    result_1.fail.error = result_1.error.invalReq;
                    result_1.fail.errdesc = '닉네임이 중복되었어요.';
                    this.res.status(400).send(result_1.fail);
                    return;
                }
                let idCheckParams = {
                    TableName: 'Member',
                    KeyConditionExpression: 'id = :id',
                    ExpressionAttributeValues: { ':id': params.id }
                };
                let idCheckResult = yield this.Dynamodb.query(idCheckParams).promise();
                console.log(idCheckResult.Items);
                if (idCheckResult.Items.length != 0) {
                    result_1.fail.error = result_1.error.invalReq;
                    result_1.fail.errdesc = '아이디가 중복되었어요.';
                    this.res.status(400).send(result_1.fail);
                    return;
                }
                yield bcrypt.hash(params.pw, saltRounds).then(function (hash) {
                    pw = hash;
                });
                var queryParams = {
                    TableName: 'Member',
                    Item: {
                        id: params.id,
                        pw: pw,
                        profileImg: process.env.domain + 'defaultProfileImg.jpg',
                        nickname: params.nickname,
                        isManager: params.isManager,
                        primeBadge: null,
                        badge: [],
                        coupons: [],
                        myCampaigns: [],
                        playingCampaigns: [],
                        selfIntroduction: '자기소개를 꾸며보세요.',
                        comments: []
                    },
                    ConditionExpression: "attribute_not_exists(id)" //항목 추가하기 전에 이미 존재하는 항목이 있을 경우 pk가 있을 때 조건 실패. pk는 반드시 있어야 하므로 replace를 방지
                };
                this.Dynamodb.put(queryParams, this.onInsert.bind(this));
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
    onInsert(err, data) {
        if (err) {
            result_1.fail.error = result_1.error.invalReq;
            result_1.fail.errdesc = 'ID가 중복되었어요.';
            this.res.status(400).send(err);
        }
        else {
            result_1.success.data = '회원가입 성공';
            this.res.status(201).send(result_1.success);
            responseInit_1.successInit(result_1.success);
        }
    }
    /**
     * logout 로직
     * 1. sessionManager에서 세션 id로 검색
     * 2. 검색 결과의 사용자 id가 입력받은 사용자의 id와 동일한지 검증
     * 3. 동일한 경우 세션 삭제
     * 4. 다른 경우 잘못된 접근 경고
     */
    logout(params) {
        let id = params.id;
        const run = () => __awaiter(this, void 0, void 0, function* () {
            console.log(this.req.session.passport.user.id);
            let sessId = this.req.session.passport.user.id;
            if (sessId == id) {
                this.req.session.destroy(() => {
                    this.req.session;
                });
                result_1.success.data = params.id;
                console.log('로그아웃 성공');
                console.log(`응답 JSON\n${JSON.stringify(result_1.success, null, 2)}`);
                this.res.status(200).send(result_1.success);
                responseInit_1.successInit(result_1.success);
                return;
            }
            result_1.fail.error = result_1.error.invalAcc;
            result_1.fail.errdesc = '잘못된 접근입니다.';
            console.log(`ID와 세션 정보가 다릅니다.\n${JSON.stringify(result_1.fail, null, 2)}`);
            this.res.status(400).send(result_1.fail);
            return;
        });
        run();
    }
    read(params) {
        let id = this.req.session.passport.user.id;
        let queryParams = {
            TableName: 'Member',
            KeyConditionExpression: 'id = :id',
            ExpressionAttributeValues: { ':id': id },
            ProjectionExpression: 'myCampaigns, playingCampaigns, badge'
        };
        const run = () => __awaiter(this, void 0, void 0, function* () {
            try {
                let result = yield this.Dynamodb.query(queryParams).promise();
                let myCampaign = result.Items[0].myCampaigns.length;
                let playingCampaign = result.Items[0].playingCampaigns;
                let badge = result.Items[0].badge;
                let participateCamp = [];
                let clearCamp = [];
                playingCampaign.forEach(campaign => {
                    if (campaign.cleared == true) {
                        clearCamp.push(campaign);
                    }
                    else {
                        participateCamp.push(campaign);
                    }
                });
                let data = {
                    playingCampaign: playingCampaign.length,
                    myCampaign: myCampaign,
                    clearCampaign: clearCamp.length,
                    badge: badge
                };
                result_1.success.data = data;
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
        let uid = this.req.session.passport.user.id;
        if (uid != params.uid) {
            result_1.fail.error = result_1.error.invalAcc;
            result_1.fail.errdesc = '잘못된 접근입니다.';
            this.res.status(400).send(result_1.fail);
            return;
        }
        let profileImg = params.imgs;
        let nickname = params.nickname;
        let selfIntroduction = params.selfIntroduction;
        let updateExp = 'SET ';
        let expAttrVal = {};
        if (nickname == '(알수없음)') {
            result_1.fail.error = result_1.error.invalReq;
            result_1.fail.errdesc = '잘못된 닉네임입니다.';
            this.res.status(400).send(result_1.fail);
            return;
        }
        let updateParams = {
            TableName: 'Member',
            Key: { id: params.uid },
            UpdateExpression: null,
            ExpressionAttributeValues: null,
            RetrunValues: 'ALL_NEW',
            ConditionExpression: 'attribute_exists(id)'
        };
        const run = () => __awaiter(this, void 0, void 0, function* () {
            try {
                if (profileImg != '') {
                    updateExp += 'profileImg = :profileImg ';
                    expAttrVal[":profileImg"] = profileImg;
                }
                if (nickname != '') {
                    let checkParams = {
                        TableName: 'Member',
                        IndexName: 'nicknameIndex',
                        KeyConditionExpression: `nickname = :value`,
                        ExpressionAttributeValues: { ':value': params.nickname }
                    };
                    console.log('닉네임 중복 여부 확인중...');
                    let queryResult = yield this.Dynamodb.query(checkParams).promise();
                    if (queryResult.Items.length != 0) {
                        result_1.fail.error = result_1.error.invalKey;
                        result_1.fail.errdesc = '닉네임이 중복되었어요';
                        this.res.status(400).send(result_1.fail);
                        return;
                    }
                    console.log(`닉네임 중복 통과.\nUpdate 쿼리 작성중`);
                    if (updateExp.length == 4) {
                        updateExp += 'nickname = :nickname ';
                        expAttrVal[':nickname'] = nickname;
                    }
                    else {
                        updateExp += ', nickname = :nickname ';
                        expAttrVal[':nickname'] = nickname;
                    }
                }
                if (selfIntroduction != '') {
                    if (updateExp.length == 4) {
                        updateExp += 'selfIntroduction = :selfIntroduction';
                        expAttrVal[':selfIntroduction'] = selfIntroduction;
                    }
                    else {
                        updateExp += ', selfIntroduction = :selfIntroduction';
                        expAttrVal[':selfIntroduction'] = selfIntroduction;
                    }
                }
                updateParams.UpdateExpression = updateExp;
                updateParams.ExpressionAttributeValues = expAttrVal;
                console.log(`쿼리 작성 완료. 작성된 쿼리\n${JSON.stringify(updateParams, null, 2)}`);
                console.log('회원정보 수정중');
                let result = yield this.Dynamodb.update(updateParams).promise();
                console.log(`회원정보 수정 성공.${JSON.stringify(result, null, 2)}`);
                result_1.success.data = { profileImg };
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
    delete(params) {
        let uid = this.req.session.passport.user.id;
        let memberParam = {
            TableName: 'Member',
            KeyConditionExpression: 'id = :id',
            ProjectionExpression: 'playingCampaigns',
            ExpressionAttributeValues: { ':id': uid }
        };
        let deleteMemberParam = {
            TableName: 'Member',
            Key: { id: uid },
            UpdateExpression: 'set nickname = :nickname, profimeImg = :defaultImg',
            ExpressionAttributeValues: { ':nickname': '(알수없음)', ':defaultImg': 'https://walk-into-town.kro.kr/defaultProfileImg.jpg' },
            ConditionExpression: 'attribute_exists(id)'
        };
        let campaignParams = {
            TableName: 'Campaign',
            KeyConditionExpression: 'id = :id',
            ProjectionExpression: '#users',
            ExpressionAttributeNames: { '#users': 'users' },
            ExpressionAttributeValues: { ':id': null }
        };
        let campaignUpdateParam = {
            TableName: 'Campaign',
            Key: { id: null },
            UpdateExpression: 'set #users = :newusers',
            ExpressionAttributeNames: { '#users': 'users' },
            ExpressionAttributeValues: { ':newusers': null }
        };
        const run = () => __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('참여중인 캠페인 조회중');
                let campResult = yield this.Dynamodb.query(memberParam).promise();
                let playing = campResult.Items[0].playingCampaigns;
                console.log(`참여중인 캠페인 조회 완료\n${JSON.stringify(playing, null, 2)}`);
                console.log('참여중인 캠페인 수정중');
                for (const campaign of playing) {
                    console.log('캠페인 참여 유저 확인중');
                    campaignParams.ExpressionAttributeValues[":id"] = campaign.id;
                    let camp = yield this.Dynamodb.query(campaignParams).promise();
                    let users = camp.Items[0].users;
                    for (let i = 0; i < users.length; i++) {
                        if (uid == users[i]) {
                            users.splice(i, 1);
                            campaignUpdateParam.Key.id = campaign.id;
                            campaignUpdateParam.ExpressionAttributeValues[":newusers"] = users;
                            yield this.Dynamodb.update(campaignUpdateParam).promise();
                            break;
                        }
                    }
                    console.log('캠페인 참여 유저 수정 완료');
                }
                console.log('캠페인 수정 완료\n회원 삭제 시작');
                yield this.Dynamodb.update(deleteMemberParam).promise();
                console.log('회원 삭제 성공');
                result_1.success.data = '탈퇴 성공';
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
    check(type, params) {
        let index = null;
        let value = null;
        switch (type) {
            case 'id':
                value = params.id;
                break;
            case 'nickname':
                index = 'nicknameIndex';
                value = params.nickname;
                break;
            default:
                break;
        }
        params = {
            TableName: 'Member',
            IndexName: index,
            KeyConditionExpression: `${type} = :value`,
            ExpressionAttributeValues: { ':value': value }
        };
        const run = () => __awaiter(this, void 0, void 0, function* () {
            try {
                let queryResult = yield this.Dynamodb.query(params).promise();
                if (queryResult.Items.length == 0) {
                    result_1.fail.error = result_1.error.invalKey;
                    result_1.fail.errdesc = '중복되었어요';
                    this.res.status(400).send(result_1.fail);
                    return;
                }
                else {
                    result_1.success.data = '가능해요';
                    this.res.status(200).send(result_1.success);
                    responseInit_1.successInit(result_1.success);
                    return;
                }
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
    readPlaying(params) {
        let id = params.uid;
        if (id != this.req.session.passport.user.id) {
            result_1.fail.error = result_1.error.invalAcc;
            result_1.fail.errdesc = "잘못된 접근입니다.";
            this.res.status(400).send(result_1.fail);
            return;
        }
        let queryParams = {
            TableName: 'Member',
            KeyConditionExpression: 'id = :id',
            ExpressionAttributeValues: { ':id': id },
            ProjectionExpression: 'playingCampaigns'
        };
        let campaignParams = {
            RequestItems: {
                'Campaign': {
                    Keys: null,
                    ProjectionExpression: 'id, #name, imgs, description, #region, pinpoints',
                    ExpressionAttributeNames: { '#name': 'name', '#region': 'region' },
                }
            }
        };
        const run = () => __awaiter(this, void 0, void 0, function* () {
            try {
                let uid = this.req.session.passport.user.id;
                if (uid != params.uid) {
                    result_1.fail.error = result_1.error.invalAcc;
                    result_1.fail.errdesc = "잘못된 접근입니다.";
                    this.res.status(400).send(result_1.fail);
                    return;
                }
                console.log(`DB 읽어오는중...`);
                let result = yield this.Dynamodb.query(queryParams).promise(); // 사용자의 플레이중 캠페인 가져오기
                if (result.Items[0].playingCampaigns.length == 0) { // 없는 경우 빈 배열 반환
                    result_1.success.data = [];
                    this.res.status(200).send(result_1.success);
                    responseInit_1.successInit(result_1.success);
                    return;
                }
                console.log(`읽기 성공! 결과 JSON\n${JSON.stringify(result.Items[0].playingCampaigns, null, 2)}`);
                let keys = [];
                for (const campaign of result.Items[0].playingCampaigns) { // 플레이중 캠페인의 id로 batchget
                    let obj = {
                        'id': campaign.id
                    };
                    keys.push(obj);
                }
                campaignParams.RequestItems.Campaign.Keys = keys;
                let data = result.Items[0].playingCampaigns;
                let camp = yield this.Dynamodb.batchGet(campaignParams).promise(); // 캠페인 정보를 가져오기
                let campaigns = camp.Responses.Campaign;
                for (const campaign of campaigns) { // 가져온 캠페인에 대해서
                    for (let i = 0; i < data.length; i++) { // 사용자의 캠페인에 대해서
                        if (data[i].id == campaign.id) { // 참여중 캠페인 = 조회한 캠페인의 경우
                            data[i].name = campaign.name;
                            data[i].imgs = campaign.imgs;
                            data[i].description = campaign.description;
                            data[i].region = campaign.region;
                            data[i].clearedPinpoints = data[i].pinpoints;
                            data[i].pinpoints = campaign.pinpoints;
                        }
                    }
                }
                result_1.success.data = data;
                this.res.status(200).send(result_1.success);
                responseInit_1.successInit(result_1.success);
            }
            catch (err) {
                console.log(err);
                result_1.fail.error = result_1.error.dbError;
                result_1.fail.errdesc = err;
                this.res.status(521).send(err);
            }
        });
        run();
    }
    readPlayingPinpoint(params) {
        let uid = this.req.session.passport.user.id;
        let memberParam = {
            TableName: 'Member',
            KeyConditionExpression: 'id = :id',
            ProjectionExpression: 'playingCampaigns',
            ExpressionAttributeValues: { ':id': uid }
        };
        let campaignParam = {
            RequestItems: {
                'Campaign': {
                    Keys: [],
                    ProjectionExpression: 'id, #name, imgs, description, #region, pinpoints',
                    ExpressionAttributeNames: { '#name': 'name', '#region': 'region' },
                }
            }
        };
        let pinpointParam = {
            RequestItems: {
                'Pinpoint': {
                    Keys: [],
                    ProjectionExpression: 'id, #name, imgs, latitude, longitude, description, updateTime, coupons, comments, quiz',
                    ExpressionAttributeNames: { '#name': 'name' }
                }
            }
        };
        const run = () => __awaiter(this, void 0, void 0, function* () {
            try {
                result_1.success.data = {
                    clearedPinpoints: [],
                    pinpoints: []
                };
                let pinpoint2respond = [];
                console.log('참여중인 캠페인 목록 조회중');
                let memberResult = yield this.Dynamodb.query(memberParam).promise();
                let playing = memberResult.Items[0].playingCampaigns;
                console.log(`참여중인 캠페인 목록 조회 성공\n${JSON.stringify(playing, null, 2)}`);
                if (playing.length == 0) {
                    result_1.success.data.clearedPinpoints = [];
                    result_1.success.data.pinpoints = [];
                    this.res.status(200).send(result_1.success);
                    responseInit_1.successInit(result_1.success);
                    return;
                }
                console.log('캠페인 조회 parameter 생성중');
                let playingPinpoints = []; // 클리어한 핀포인트를 담는 배열
                for (const camp of playing) { // 참여중 캠페인에 대해서
                    // if(camp.cleared == true){           // 클리어한 경우 통과
                    //     continue
                    // }                                   // 클리어하지 않은 경우
                    playingPinpoints.push(...camp.pinpoints); // 클리어한 핀포인트 추가
                    let obj = { id: camp.id };
                    campaignParam.RequestItems.Campaign.Keys.push(obj); // 캠페인 요청 parameter에 id 추가
                }
                // if(campaignParam.RequestItems.Campaign.Keys.length == 0){   // 추가된 id가 없는 경우 = 모든 캠페인 클리어
                //     fail.error = error.invalReq
                //     fail.errdesc = '모든 캠페인을 클리어했습니다.'
                //     this.res.status(200).send(fail)
                //     return;
                // }
                console.log('캠페인 조회 param 생성 완료\n캠페인의 핀포인트 id 조회 시작');
                let campaignResult = yield this.Dynamodb.batchGet(campaignParam).promise();
                let campaigns = campaignResult.Responses.Campaign;
                for (const camp of campaigns) { // 조회한 캠페인에 대해
                    for (const pid of camp.pinpoints) { // 조회한 캠페인의 핀포인트에 대해
                        // let pos = playingPinpoints.indexOf(pid)     // 클리어한 핀포인트가 있는지 조회
                        // if(pos != -1){                          // 이미 클리어한 핀포인트인 경우 통과
                        //     continue;
                        // }
                        let obj = {
                            'id': pid
                        };
                        pinpointParam.RequestItems.Pinpoint.Keys.push(obj); // 아닌경우 핀포인트 요청 parameter에 id 추가
                    }
                    let pinpointResult = yield this.Dynamodb.batchGet(pinpointParam).promise();
                    let pinpoints = pinpointResult.Responses.Pinpoint;
                    camp.pinpoints = pinpoints; // 가져온 핀포인트의 값을 해당 campaign의 pinpint를 대체
                    pinpoint2respond.push(...pinpoints);
                    pinpointParam.RequestItems.Pinpoint.Keys = []; // 요청 parameter의 id 초기화
                }
                result_1.success.data.clearedPinpoints = playingPinpoints;
                result_1.success.data.pinpoints = pinpoint2respond;
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
    readMyCamp(params) {
        let id = params.uid;
        if (id != this.req.session.passport.user.id) {
            result_1.fail.error = result_1.error.invalAcc;
            result_1.fail.errdesc = "잘못된 접근입니다.";
            this.res.status(400).send(result_1.fail);
            return;
        }
        let queryParams = {
            TableName: 'Member',
            KeyConditionExpression: 'id = :id',
            ExpressionAttributeValues: { ':id': id },
            ProjectionExpression: 'myCampaigns'
        };
        let campaignParams = {
            RequestItems: {
                'Campaign': {
                    Keys: null,
                    ProjectionExpression: 'id, #name, imgs, description',
                    ExpressionAttributeNames: { '#name': 'name' }
                }
            }
        };
        const run = () => __awaiter(this, void 0, void 0, function* () {
            try {
                let uid = this.req.session.passport.user.id;
                if (uid != params.uid) {
                    result_1.fail.error = result_1.error.invalAcc;
                    result_1.fail.errdesc = "잘못된 접근입니다.";
                    this.res.status(400).send(result_1.fail);
                    return;
                }
                console.log(`DB 읽어오는중...`);
                let result = yield this.Dynamodb.query(queryParams).promise();
                if (result.Items[0].myCampaigns.length == 0) {
                    result_1.success.data = [];
                    this.res.status(200).send(result_1.success);
                    responseInit_1.successInit(result_1.success);
                    return;
                }
                console.log(`읽기 성공! 결과 JSON\n${JSON.stringify(result.Items[0].myCampaigns)}`);
                let keys = [];
                for (const id of result.Items[0].myCampaigns) {
                    let obj = {
                        'id': id
                    };
                    keys.push(obj);
                }
                campaignParams.RequestItems.Campaign.Keys = keys;
                let data = keys;
                let camp = yield this.Dynamodb.batchGet(campaignParams).promise();
                let campaigns = camp.Responses.Campaign;
                for (const campaign of campaigns) {
                    for (let i = 0; i < data.length; i++) {
                        if (data[i].id == campaign.id) {
                            data[i].name = campaign.name;
                            data[i].imgs = campaign.imgs;
                            data[i].description = campaign.description;
                        }
                    }
                }
                result_1.success.data = data;
                this.res.status(200).send(result_1.success);
                responseInit_1.successInit(result_1.success);
            }
            catch (err) {
                console.log(err);
                result_1.fail.error = result_1.error.dbError;
                result_1.fail.errdesc = err;
                this.res.status(521).send(err);
            }
        });
        run();
    }
    deleteMyCamp(params) {
        if (this.req.session.passport.user.id != params.uid) {
            result_1.fail.error = result_1.error.invalAcc;
            result_1.fail.errdesc = '세션 정보와 id가 일치하지 않습니다.';
            this.res.status(400).send(result_1.fail);
            return;
        }
        let mycampParams = {
            TableName: 'Member',
            KeyConditionExpression: 'id = :id',
            ProjectionExpression: 'myCampaigns, playingCampaigns',
            ExpressionAttributeValues: { ':id': params.uid }
        };
        let campParams = {
            TableName: 'Campaign',
            KeyConditionExpression: 'id = :id',
            ExpressionAttributeValues: { ':id': params.caid }
        };
        let deleteparam = {
            TableName: '',
            Key: {
                'id': null
            }
        };
        let updateParams = {
            TableName: 'Member',
            Key: null,
            UpdateExpression: null,
            ExpressionAttributeValues: { ':newCampaign': null },
            ReturnValues: 'UPDATED_NEW',
            ConditionExpression: "attribute_exists(id)"
        };
        let getParams = {
            TableName: 'Member',
            KeyConditionExpression: 'id = :id',
            ProjectionExpression: 'playingCampaigns',
            ExpressionAttributeValues: { ':id': null }
        };
        const run = () => __awaiter(this, void 0, void 0, function* () {
            try {
                const myResult = yield this.Dynamodb.query(mycampParams).promise();
                const mycamps = myResult.Items[0].myCampaigns;
                console.log('일치하는 캠페인 검색중');
                for (let i = 0; mycamps.length; i++) {
                    if (mycamps[i] == params.caid) {
                        mycamps.splice(i, 1);
                        console.log('일치함');
                        break;
                    }
                    if (i == mycamps.length - 1) {
                        result_1.fail.error = result_1.error.invalKey;
                        result_1.fail.errdesc = '일치하는 캠페인을 찾을 수 없습니다.';
                        this.res.status(400).send(result_1.fail);
                        return;
                    }
                }
                let delcmapResult = yield this.Dynamodb.query(campParams).promise();
                let deleteItems = delcmapResult.Items[0];
                console.log(`삭제할 항목 목록\n${JSON.stringify(deleteItems, null, 2)}`);
                let delCoupon = deleteItems.coupons;
                let delPcoupon = deleteItems.pcoupons;
                let delPinpoints = deleteItems.pinpoints;
                let delCampaign = deleteItems.id;
                let delMember = deleteItems.users;
                if (delCoupon.length != 0) {
                    console.log('캠페인 쿠폰 삭제중');
                    deleteparam.TableName = '';
                    for (let i = 0; i < delCoupon.length; i++) {
                        deleteparam.Key.id = delCoupon[i];
                        console.log(`${i}번째 캠페인 쿠폰 삭제중`);
                        yield this.Dynamodb.delete(deleteparam).promise();
                        console.log('캠페인 쿠폰 삭제 성공');
                    }
                    console.log('전체 캠페인 쿠폰 삭제 성공');
                }
                if (delPcoupon.length != 0) {
                    deleteparam.TableName = 'Coupon';
                    for (let i = 0; i < delPcoupon.length; i++) {
                        deleteparam.Key.id = delPcoupon[i];
                        console.log(`${i}번째 핀포인트 쿠폰 삭제중`);
                        yield this.Dynamodb.delete(deleteparam).promise();
                        console.log('핀포인트 쿠폰 삭제 성공');
                    }
                    console.log('전체 핀포인트 쿠폰 삭제 성공');
                }
                deleteparam.TableName = 'Pinpoint';
                for (let i = 0; i < delPinpoints.length; i++) {
                    deleteparam.Key.id = delPinpoints[i];
                    console.log(`${i}번째 핀포인트 삭제중`);
                    yield this.Dynamodb.delete(deleteparam).promise();
                    console.log('핀포인트 삭제 성공');
                }
                console.log('전체 핀포인트 삭제 성공');
                console.log('참여자 목록 갱신중');
                for (const id of delMember) {
                    getParams.ExpressionAttributeValues[":id"] = id;
                    let queryResult = yield this.Dynamodb.query(getParams).promise();
                    let playingCamps = queryResult.Items[0].playingCampaigns;
                    for (let i = 0; i < playingCamps.length; i++) {
                        if (playingCamps[i].id == params.caid) {
                            playingCamps.splice(i, 1);
                            break;
                        }
                        if (i == playingCamps.length - 1) {
                            result_1.fail.error = result_1.error.invalKey;
                            result_1.fail.errdesc = '캠페인을 찾을 수 없습니다.';
                            this.res.status(400).send(result_1.fail);
                            return;
                        }
                    }
                    updateParams.ExpressionAttributeValues[":newCampaign"] = playingCamps;
                    updateParams.UpdateExpression = 'set playingCampaigns = :newCampaign)';
                    updateParams.Key = { 'id': id };
                    yield this.Dynamodb.update(updateParams).promise();
                }
                console.log('참여자 목록 갱신 완료');
                updateParams.ExpressionAttributeValues[":newCampaign"] = mycamps;
                updateParams.UpdateExpression = 'set myCampaigns = :newCampaign';
                updateParams.Key = { 'id': params.uid };
                yield this.Dynamodb.update(updateParams).promise();
                deleteparam.TableName = 'Campaign';
                deleteparam.Key.id = delCampaign;
                yield this.Dynamodb.delete(deleteparam).promise();
                console.log('캠페인 삭제 성공');
                result_1.success.data = '제작한 캠페인 삭제 성공';
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
    checkPlaying(params) {
        params.uid = nbsp_1.nbsp2plus(params.uid);
        params.caid = nbsp_1.nbsp2plus(params.caid);
        let queryParams = {
            TableName: 'Member',
            KeyConditionExpression: 'id = :id',
            ProjectionExpression: 'playingCampaigns',
            ExpressionAttributeValues: { ':id': params.uid }
        };
        const run = () => __awaiter(this, void 0, void 0, function* () {
            try {
                let result = yield this.Dynamodb.query(queryParams).promise();
                let playing = result.Items[0].playingCampaigns;
                console.log(playing);
                if (playing.length == 0) {
                    result_1.success.data = [];
                    this.res.status(200).send(result_1.success);
                    return;
                }
                for (const camp of playing) {
                    if (camp.id == params.caid) {
                        result_1.success.data = false;
                        this.res.status(200).send(result_1.success);
                        responseInit_1.successInit(result_1.success);
                        return;
                    }
                }
                result_1.success.data = true;
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
    deletePlaying(params) {
        let uid = params.uid;
        let caid = params.caid;
        if (uid != this.req.session.passport.user.id) {
            result_1.fail.error = result_1.error.invalAcc;
            result_1.fail.errdesc = '세션 정보와 id가 일치하지않습니다.';
            this.res.status(400).send(result_1.fail);
            return;
        }
        let queryParams = {
            TableName: 'Member',
            KeyConditionExpression: 'id = :id',
            ProjectionExpression: 'playingCampaigns',
            ExpressionAttributeValues: { ':id': uid }
        };
        let updateParams = {
            TableName: 'Member',
            Key: { id: uid },
            UpdateExpression: null,
            ExpressionAttributeValues: null,
            RetrunValues: 'ALL_NEW',
            ConditionExpression: 'attribute_exists(id)'
        };
        let getCampParam = {
            TableName: 'Campaign',
            KeyConditionExpression: 'id = :id',
            ExpressionAttributeValues: { ':id': caid }
        };
        let campUpdateParam = {
            TableName: 'Campaign',
            Key: { id: caid },
            UpdateExpression: 'set #users = :users',
            ExpressionAttributeValues: { ':users': null },
            ExpressionAttributeNames: { '#users': 'users' }
        };
        var insertParams = {
            TableName: 'Block',
            Item: {
                uid: this.req.session.passport.user.id,
                tid: params.caid,
                start: new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString(),
                time: 1000 * 60 * 60 * 24 * 3
            },
            ConditionExpression: "attribute_not_exists(uid) and attribute_not_exists(tid)" //항목 추가하기 전에 이미 존재하는 항목이 있을 경우 pk가 있을 때 조건 실패. pk는 반드시 있어야 하므로 replace를 방지
        };
        const run = () => __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('참여중 캠페인 검색중');
                let campResult = yield this.Dynamodb.query(queryParams).promise();
                console.log(`참여중 캠페인\n${JSON.stringify(campResult.Items[0].playingCampaigns, null, 2)}`);
                let playingCamps = campResult.Items[0].playingCampaigns;
                for (let i = 0; i < playingCamps.length; i++) {
                    if (playingCamps[i].id == caid) {
                        playingCamps.splice(i, 1);
                        break;
                    }
                    if (i == playingCamps.length - 1) {
                        result_1.success.data = [];
                        this.res.status(400).send(result_1.success);
                        return;
                    }
                }
                console.log('캠페인 users 수정중');
                let updateCampResult = yield this.Dynamodb.query(getCampParam).promise();
                let users = updateCampResult.Items[0].users;
                for (let i = 0; i < users.length; i++) {
                    if (users[i] == uid) {
                        users.splice(i, 1);
                        break;
                    }
                }
                campUpdateParam.ExpressionAttributeValues[":users"] = users;
                yield this.Dynamodb.update(campUpdateParam).promise();
                console.log('캠페인 users 수정완료');
                updateParams.UpdateExpression = 'SET playingCampaigns = :playingCamp';
                updateParams.ExpressionAttributeValues = { ':playingCamp': playingCamps };
                console.log('참여중 캠페인 삭제중');
                yield this.Dynamodb.update(updateParams).promise();
                result_1.success.data = '삭제 성공';
                console.log('재참여 제한 설정중');
                yield this.Dynamodb.put(insertParams).promise();
                console.log('재참여 재한 성공');
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
    readMyCoupon(params) {
        let id = this.req.session.passport.user.id;
        let memberparams = {
            TableName: 'Member',
            KeyConditionExpression: 'id = :id',
            ExpressionAttributeValues: { ':id': id },
            ProjectionExpression: 'coupons'
        };
        let couponBatch = {
            RequestItems: {
                'Coupon': {
                    Keys: []
                }
            }
        };
        const run = () => __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('내 쿠폰 조회중');
                let memberResult = yield this.Dynamodb.query(memberparams).promise();
                let couponIds = memberResult.Items[0].coupons;
                console.log(`조회 성공. 내 쿠폰 목록\n${JSON.stringify(couponIds, null, 2)}`);
                if (couponIds.length == 0) {
                    result_1.success.data = [];
                    this.res.status(200).send(result_1.success);
                    responseInit_1.successInit(result_1.success);
                    return;
                }
                for (const coupon of couponIds) {
                    let obj = {
                        'id': coupon.id
                    };
                    couponBatch.RequestItems.Coupon.Keys.push(obj);
                }
                console.log('쿠폰 테이블 조회중');
                let couponResult = yield this.Dynamodb.batchGet(couponBatch).promise();
                let coupons = couponResult.Responses.Coupon;
                console.log(`쿠폰 테이블 조회 성공. 조회한 쿠폰\n${JSON.stringify(coupons, null, 2)}`);
                for (const coupon of coupons) {
                    for (const c of couponIds) {
                        if (c.id == coupon.id) {
                            coupon.used = c.used;
                            break;
                        }
                    }
                }
                result_1.success.data = coupons;
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
    checkCampaign(params) {
        params.caid = nbsp_1.nbsp2plus(params.caid);
        let memberparams = {
            TableName: 'Member',
            KeyConditionExpression: 'id = :id',
            ExpressionAttributeValues: { ':id': this.req.session.passport.user.id },
            ProjectionExpression: 'playingCampaigns'
        };
        const run = () => __awaiter(this, void 0, void 0, function* () {
            let memberResult = yield this.Dynamodb.query(memberparams).promise();
            let playing = memberResult.Items[0].playingCampaigns;
            if (playing.length == 0) {
                result_1.fail.error = result_1.error.invalReq;
                result_1.fail.errdesc = '참여중인 캠페인이 없습니다.';
                this.res.status(400).send(result_1.fail);
                return;
            }
            for (const camp of playing) {
                if (camp.id == params.caid && camp.cleared == true) {
                    result_1.success.data = true;
                    this.res.status(200).send(result_1.success);
                    return;
                }
                if (camp.id == params.caid && camp.cleared == false) {
                    result_1.success.data = false;
                    this.res.status(200).send(result_1.success);
                    return;
                }
            }
            result_1.fail.error = result_1.error.dataNotFound;
            result_1.fail.errdesc = '캠페인 id를 찾을 수 없습니다.';
            this.res.status(400).send(result_1.fail);
        });
        run();
    }
}
exports.default = MemberManager;
