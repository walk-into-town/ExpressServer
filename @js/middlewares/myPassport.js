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
const dotenv = __importStar(require("dotenv"));
const SocialRegister_1 = __importDefault(require("../modules/DBManager/SocialRegister"));
dotenv.config();
const AWS = require('aws-sdk');
AWS.config.update({
    accessKeyId: process.env.aws_access_key_id,
    secretAccessKey: process.env.aws_secret_access_key,
    region: process.env.dynamoRegion,
    endpoint: process.env.dynamoEndpoint
});
const bcrypt = require('bcrypt');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const KakaoStrategy = require('passport-kakao').Strategy;
const NaverStrategy = require('passport-naver').Strategy;
module.exports = () => {
    // ???????????? ????????? User?????? ????????? ???????????? ??????
    passport.serializeUser(function (user, done) {
        done(null, user);
    });
    // DB??? ????????? ????????? ????????? ??? ???????????? ??????
    passport.deserializeUser(function (id, done) {
        done(null, id);
    });
    passport.use(new LocalStrategy({
        usernameField: 'id',
        passwordField: 'pw'
    }, function (username, password, done) {
        return __awaiter(this, void 0, void 0, function* () {
            AWS.config.update({
                region: process.env.dynamoRegion,
                endpoint: process.env.dynamoEndpoint
            });
            let doclient = new AWS.DynamoDB.DocumentClient();
            console.log('?????? ?????? ?????????');
            let prisonResult = yield doclient.query({
                TableName: 'Prison',
                KeyConditionExpression: 'id = :id',
                ExpressionAttributeValues: { ':id': username }
            }).promise();
            let prison = prisonResult.Items[0];
            if (prison != undefined) {
                let endTime = new Date(prison.startTime).getTime() + prison.time;
                let currTime = new Date(Date.now() + 9 * 60 * 60 * 1000).getTime();
                if (endTime > currTime) {
                    let diff = endTime - currTime;
                    let hour = Math.floor(diff / 1000 / 60 / 60);
                    let min = Math.floor(diff / 1000 / 60) % 60;
                    let sec = Math.floor(diff / 1000) % 60;
                    console.log('????????? ???????????????.');
                    return done(null, false, { message: `????????? ??????????????????. ?????? ?????? : ${hour}?????? ${min}??? ${sec}???` });
                }
                else {
                    let deleteParam = {
                        TableName: 'Prison',
                        Key: { id: username }
                    };
                    yield doclient.delete(deleteParam).promise();
                }
            }
            let result = yield doclient.query({
                TableName: 'Member',
                KeyConditionExpression: 'id = :id',
                ExpressionAttributeValues: { ':id': username }
            }).promise();
            if (result.Items[0] == undefined) {
                console.log('ID ?????????');
                return done(null, false, { message: 'ID ?????? ??????????????? ?????????????????????.' });
            }
            if (result.Items[0].nickname == '(????????????)') {
                console.log('????????? ???????????????.');
                return done(null, false, { message: '????????? ???????????????.' });
            }
            console.log('ID ??????');
            let pw = result.Items[0].pw;
            console.log('PW ?????????...');
            const match = yield bcrypt.compare(password, pw);
            if (match == true) {
                let user = {
                    id: username,
                    nickname: result.Items[0].nickname,
                    profileImg: result.Items[0].profileImg,
                    selfIntroduction: result.Items[0].selfIntroduction,
                    quiz: []
                };
                console.log('PW ??????');
                return done(null, user);
            }
            else {
                console.log('???????????? ?????????');
                return done(null, false, { message: 'ID ?????? ??????????????? ?????????????????????.' });
            }
        });
    }));
    passport.use(new GoogleStrategy({
        clientID: process.env.googleID,
        clientSecret: process.env.googleSecret,
        callbackURL: process.env.googleAuthCallback // ????????? ????????? ???????????? ?????????
    }, function (accessToken, refreshToken, profile, cb) {
        let doclient = new AWS.DynamoDB.DocumentClient();
        let username = `google${profile.emails[0].value}`;
        let params = {
            TableName: 'Member',
            KeyConditionExpression: 'id = :id',
            ExpressionAttributeValues: { ':id': username }
        };
        const run = () => __awaiter(this, void 0, void 0, function* () {
            console.log('?????? ?????????');
            const getRandomNumber = () => {
                return Math.floor(Math.random() * (999999 - 100000)) + 100000;
            };
            let prisonResult = yield doclient.query({
                TableName: 'Prison',
                KeyConditionExpression: 'id = :id',
                ExpressionAttributeValues: { ':id': username }
            }).promise();
            let prison = prisonResult.Items[0];
            if (prison != undefined) {
                let endTime = new Date(prison.startTime).getTime() + prison.time;
                let currTime = new Date(Date.now() + 9 * 60 * 60 * 1000).getTime();
                if (endTime > currTime) {
                    let diff = endTime - currTime;
                    let hour = Math.floor(diff / 1000 / 60 / 60);
                    let min = Math.floor(diff / 1000 / 60) % 60;
                    let sec = Math.floor(diff / 1000) % 60;
                    console.log('????????? ???????????????.');
                    return cb(null, false, { message: `????????? ??????????????????. ?????? ?????? : ${hour}?????? ${min}??? ${sec}???` });
                }
                else {
                    let deleteParam = {
                        TableName: 'Prison',
                        Key: { id: username }
                    };
                    yield doclient.delete(deleteParam).promise();
                }
            }
            let data = yield doclient.query(params).promise();
            let result = data.Items[0];
            if (result.Items[0].nickname == '(????????????)') {
                console.log('????????? ???????????????.');
                return cb(null, false, { message: '????????? ???????????????.' });
            }
            if (result == undefined) { //id ????????????
                console.log('????????? ?????? ID');
                let query = {
                    id: username,
                    pw: accessToken,
                    profileImg: profile._json.picture,
                    nickname: `?????? ${getRandomNumber()}`,
                    isManager: false
                };
                let social = new SocialRegister_1.default();
                yield social.insert(query);
                let user = {
                    id: username,
                    nickname: query.nickname,
                    profileImg: query.profileImg,
                    selfIntroduction: '',
                    quiz: []
                };
                return cb(null, user);
            }
            else { // ????????? ????????? ?????? ??????
                console.log('????????? ????????? ?????? ID');
                let user = {
                    id: username,
                    nickname: result.nickname,
                    profileImg: result.profileImg,
                    selfIntroduction: result.selfIntroduction,
                    quiz: []
                };
                return cb(null, user);
            }
        });
        run();
    }));
    passport.use('kakao', new KakaoStrategy({
        clientID: process.env.kakaoID,
        clientSecret: process.env.kakaoSecret,
        callbackURL: process.env.kakaoAuthCallback
    }, function (accessToken, refreshtoken, profile, cb) {
        return __awaiter(this, void 0, void 0, function* () {
            let doclient = new AWS.DynamoDB.DocumentClient();
            let username = `kakao${profile.id}`;
            let params = {
                TableName: 'Member',
                KeyConditionExpression: 'id = :id',
                ExpressionAttributeValues: { ':id': username }
            };
            const run = () => __awaiter(this, void 0, void 0, function* () {
                console.log('????????? ?????????');
                console.log(profile._json.kakao_account.profile);
                const getRandomNumber = () => {
                    return Math.floor(Math.random() * (999999 - 100000)) + 100000;
                };
                let prisonResult = yield doclient.query({
                    TableName: 'Prison',
                    KeyConditionExpression: 'id = :id',
                    ExpressionAttributeValues: { ':id': username }
                }).promise();
                let prison = prisonResult.Items[0];
                if (prison != undefined) {
                    let endTime = new Date(prison.startTime).getTime() + prison.time;
                    let currTime = new Date(Date.now() + 9 * 60 * 60 * 1000).getTime();
                    if (endTime > currTime) {
                        let diff = endTime - currTime;
                        let hour = Math.floor(diff / 1000 / 60 / 60);
                        let min = Math.floor(diff / 1000 / 60) % 60;
                        let sec = Math.floor(diff / 1000) % 60;
                        console.log('????????? ???????????????.');
                        return cb(null, false, { message: `????????? ??????????????????. ?????? ?????? : ${hour}?????? ${min}??? ${sec}???` });
                    }
                    else {
                        let deleteParam = {
                            TableName: 'Prison',
                            Key: { id: username }
                        };
                        yield doclient.delete(deleteParam).promise();
                    }
                }
                let data = yield doclient.query(params).promise();
                let result = data.Items[0];
                if (result.Items[0].nickname == '(????????????)') {
                    console.log('????????? ???????????????.');
                    return cb(null, false, { message: '????????? ???????????????.' });
                }
                if (result == undefined) { //id ????????????
                    console.log('????????? ????????? ID');
                    let query = {
                        id: username,
                        pw: accessToken,
                        profileImg: '',
                        nickname: `?????? ${getRandomNumber()}`,
                        isManager: false
                    };
                    let social = new SocialRegister_1.default();
                    yield social.insert(query);
                    let user = {
                        id: username,
                        nickname: query.nickname,
                        profileImg: query.profileImg,
                        selfIntroduction: '',
                        quiz: []
                    };
                    return cb(null, user);
                }
                else { // ????????? ????????? ?????? ??????
                    console.log('????????? ????????? ????????? ID');
                    let user = {
                        id: username,
                        nickname: result.nickname,
                        profileImg: result.profileImg,
                        selfIntroduction: result.selfIntroduction,
                        quiz: []
                    };
                    return cb(null, user);
                }
            });
            run();
        });
    }));
    passport.use('naver', new NaverStrategy({
        clientID: process.env.naverID,
        clientSecret: process.env.naverSecret,
        callbackURL: process.env.naverAuthCallback
    }, function (accessToken, refreshToken, profile, done) {
        console.log(profile);
        let user = {
            id: 'test'
        };
        return done(profile);
    }));
};
