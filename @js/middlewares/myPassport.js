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
    region: 'us-east-1',
    endpoint: 'http://localhost:8000'
});
const bcrypt = require('bcrypt');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var GoogleStrategy = require('passport-google-oauth20').Strategy;
module.exports = () => {
    passport.serializeUser(function (user, done) {
        done(null, user);
    });
    passport.deserializeUser(function (id, done) {
        done(null, id);
    });
    passport.use(new LocalStrategy({
        usernameField: 'id',
        passwordField: 'pw'
    }, function (username, password, done) {
        return __awaiter(this, void 0, void 0, function* () {
            dotenv.config();
            AWS.config.update({
                region: 'us-east-1',
                endpoint: 'http://localhost:8000'
            });
            let doclient = new AWS.DynamoDB.DocumentClient();
            let result = yield doclient.query({
                TableName: 'Member',
                KeyConditionExpression: 'id = :id',
                ExpressionAttributeValues: { ':id': username }
            }).promise();
            if (result.Items[0] == undefined) {
                return done(null, false, { message: 'Invalid Username' });
            }
            let pw = result.Items[0].pw;
            const match = yield bcrypt.compare(password, pw);
            if (match == true) {
                let user = {
                    id: username,
                    nickname: result.Items[0].nickname,
                    profileImg: result.Items[0].profileImg,
                    selfIntroduction: result.Items[0].selfIntroduction
                };
                return done(null, user);
            }
            else {
                return done(null, false, { message: 'Invalid Password' });
            }
        });
    }));
    passport.use(new GoogleStrategy({
        clientID: process.env.googleID,
        clientSecret: process.env.googleSecret,
        callbackURL: "https://localhost:3001/auth/google/callback"
    }, function (accessToken, refreshToken, profile, cb) {
        let doclient = new AWS.DynamoDB.DocumentClient();
        let username = `google${profile.id}`;
        let params = {
            TableName: 'Member',
            KeyConditionExpression: 'id = :id',
            ExpressionAttributeValues: { ':id': username }
        };
        const run = () => __awaiter(this, void 0, void 0, function* () {
            console.log(profile._json.picture);
            let data = yield doclient.query(params).promise();
            let result = data.Items[0];
            if (result == undefined) { //id 없는경우
                let query = {
                    id: username,
                    pw: accessToken,
                    nickname: ' ',
                    isManager: false
                };
                let social = new SocialRegister_1.default();
                yield social.insert(query);
                let user = {
                    id: username,
                    nickname: ' ',
                    profileImg: '',
                    selfIntroduction: ''
                };
                return cb(null, user);
            }
            else {
                let user = {
                    id: username,
                    nickname: result.nickname,
                    profileImg: result.profileImg,
                    selfIntroduction: result.selfIntroduction
                };
                return cb(null, user);
            }
        });
        run();
    }));
};
