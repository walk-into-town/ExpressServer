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
const SessionManager_1 = __importDefault(require("./SessionManager"));
const bcrypt = __importStar(require("bcrypt"));
const result_1 = require("../../static/result");
const nbsp_1 = require("../Logics/nbsp");
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
                    this.res.status(402).send(result_1.fail);
                    return;
                }
                let idCheckParams = {
                    TableName: 'Menber',
                    KeyConditionExpression: 'id = :id',
                    ExpressionAttributeVqalues: { ':id': params.id }
                };
                let idCheckResult = yield this.Dynamodb.query(idCheckParams).promise();
                console.log(idCheckResult.Items);
                if (idCheckResult.Items.length != 0) {
                    result_1.fail.error = result_1.error.invalReq;
                    result_1.fail.errdesc = '아이디가 중복되었어요.';
                    this.res.status(402).send(result_1.fail);
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
                        selfIntroduction: '자기소개를 꾸며보세요.'
                    },
                    ConditionExpression: "attribute_not_exists(id)" //항목 추가하기 전에 이미 존재하는 항목이 있을 경우 pk가 있을 때 조건 실패. pk는 반드시 있어야 하므로 replace를 방지
                };
                this.Dynamodb.put(queryParams, this.onInsert.bind(this));
            }
            catch (err) {
                result_1.fail.error = result_1.error.dbError;
                result_1.fail.errdesc = err;
                this.res.status(402).send(result_1.fail);
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
        let sessman = new SessionManager_1.default(this.req, this.res);
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
                return;
            }
            result_1.fail.error = result_1.error.invalAcc;
            result_1.fail.errdesc = '잘못된 접근입니다.';
            console.log(`ID와 세션 정보가 다릅니다.\n${JSON.stringify(result_1.fail, null, 2)}`);
            this.res.status(402).send(result_1.fail);
            return;
        });
        run();
    }
    findMember(id) {
    }
    read(params) {
        let id = this.req.session.passport.user.id;
        let queryParams = {
            TableName: 'Member',
            KeyConditionExpression: 'id = :id',
            ExpressionAttributeValues: { ':id': id },
            ProjectionExpression: 'myCampaigns, playingCampaigns'
        };
        const run = () => __awaiter(this, void 0, void 0, function* () {
            try {
                let result = yield this.Dynamodb.query(queryParams).promise();
                let myCampaign = result.Items[0].myCampaigns.length;
                let playingCampaign = result.Items[0].playingCampaigns;
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
                    playingCampaign: participateCamp.length,
                    myCampaign: myCampaign,
                    clearCampaign: clearCamp.length
                };
                result_1.success.data = data;
                this.res.status(200).send(result_1.success);
            }
            catch (err) {
                result_1.fail.error = result_1.error.dbError;
                result_1.fail.errdesc = err;
                this.res.status(400).send(result_1.fail);
            }
        });
        run();
    }
    update(params) {
        let uid = this.req.session.passport.user.id;
        if (uid != params.id) {
            result_1.fail.error = result_1.error.invalAcc;
            result_1.fail.errdesc = '잘못된 접근입니다.';
            this.res.status(402).send(result_1.fail);
            return;
        }
        let profileImg = params.imgs;
        let nickname = params.nickname;
        let selfIntroduction = params.selfIntroduction;
        let updateExp = 'SET ';
        let expAttrVal = {};
        let updateParams = {
            TableName: 'Member',
            Key: { id: params.id },
            UpdateExpression: null,
            ExpressionAttributeValues: null,
            RetrunValues: 'UPDATED_NEW',
            ConditionExpression: 'attribute_exists(id)',
            ReturnValues: 'UPDATED_NEW'
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
                        result_1.success.data = '닉네임이 중복되었어요';
                        this.res.status(200).send(result_1.success);
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
                result_1.success.data = '회원정보 수정 성공';
                this.res.status(200).send(result_1.success);
            }
            catch (err) {
                result_1.fail.error = result_1.error.dbError;
                result_1.fail.errdesc = err;
                this.res.status(403).send(result_1.fail);
            }
        });
        run();
    }
    delete(params) {
        throw new Error("Method not implemented.");
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
                    result_1.success.data = '중복되었어요';
                    this.res.status(201).send(result_1.success);
                    return;
                }
                else {
                    result_1.success.data = '가능해요';
                    this.res.status(201).send(result_1.success);
                    return;
                }
            }
            catch (err) {
                result_1.fail.error = result_1.error.dbError;
                result_1.fail.errdesc = err;
                this.res.status(400).send(result_1.fail);
            }
        });
        run();
    }
    readPlaying(params) {
        let id = params.id;
        if (id != this.req.session.passport.user.id) {
            result_1.fail.error = result_1.error.invalAcc;
            result_1.fail.errdesc = "잘못된 접근입니다.";
            this.res.status(402).send(result_1.fail);
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
                    ProjectionExpression: 'id, #name, imgs, description',
                    ExpressionAttributeNames: { '#name': 'name' }
                }
            }
        };
        const run = () => __awaiter(this, void 0, void 0, function* () {
            try {
                let uid = this.req.session.passport.user.id;
                if (uid != params.id) {
                    result_1.fail.error = result_1.error.invalAcc;
                    result_1.fail.errdesc = "잘못된 접근입니다.";
                    this.res.status(402).send(result_1.fail);
                    return;
                }
                console.log(`DB 읽어오는중...`);
                let result = yield this.Dynamodb.query(queryParams).promise();
                if (result.Items[0].playingCampaigns.length == 0) {
                    result_1.success.data = [];
                    this.res.status(200).send(result_1.success);
                    return;
                }
                console.log(`읽기 성공! 결과 JSON\n${JSON.stringify(result.Items[0].playingCampaigns)}`);
                let keys = [];
                for (const campaign of result.Items[0].playingCampaigns) {
                    let obj = {
                        'id': campaign.id
                    };
                    keys.push(obj);
                }
                campaignParams.RequestItems.Campaign.Keys = keys;
                let data = result.Items[0].playingCampaigns;
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
            }
            catch (err) {
                result_1.fail.error = result_1.error.dbError;
                result_1.fail.errdesc = err;
                this.res.status(401).send(err);
            }
        });
        run();
    }
    readMyCamp(params) {
        let id = params.id;
        if (id != this.req.session.passport.user.id) {
            result_1.fail.error = result_1.error.invalAcc;
            result_1.fail.errdesc = "잘못된 접근입니다.";
            this.res.status(402).send(result_1.fail);
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
                if (uid != params.id) {
                    result_1.fail.error = result_1.error.invalAcc;
                    result_1.fail.errdesc = "잘못된 접근입니다.";
                    this.res.status(402).send(result_1.fail);
                    return;
                }
                console.log(`DB 읽어오는중...`);
                let result = yield this.Dynamodb.query(queryParams).promise();
                if (result.Items[0].myCampaigns.length == 0) {
                    result_1.success.data = [];
                    this.res.status(200).send(result_1.success);
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
            }
            catch (err) {
                result_1.fail.error = result_1.error.dbError;
                result_1.fail.errdesc = err;
                this.res.status(401).send(err);
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
                for (const camp of playing) {
                    if (camp.id == params.caid) {
                        result_1.success.data = '이미 참여중인 캠페인 입니다.';
                        this.res.status(200).send(result_1.success);
                        return;
                    }
                }
                result_1.success.data = '참여 가능한 캠페인 입니다.';
                this.res.status(200).send(result_1.success);
            }
            catch (err) {
                this.res.status(402).send(result_1.fail);
            }
        });
        run();
    }
}
exports.default = MemberManager;
