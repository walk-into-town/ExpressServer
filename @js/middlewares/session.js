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
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Set session
 */
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const session = require('express-session');
const AWS = require('aws-sdk');
AWS.config.update({
    accessKeyId: process.env.aws_access_key_id,
    secretAccessKey: process.env.aws_secret_access_key,
    region: 'us-east-1',
    endpoint: 'http://localhost:8000'
});
const dynamodb = new AWS.DynamoDB();
var DynamoDBStore = require('connect-dynamodb')(session);
function getSession() {
    return session({
        secret: 'SessionSecret',
        resave: false,
        saveUninitialized: false,
        rolling: true,
        store: new DynamoDBStore({
            table: 'Session',
            reapInterval: 1000,
            client: dynamodb //사용할 DyanmoDB 클라이언트.
        }),
        cookie: {
            maxAge: 1000 * 60 * 3,
            httpOnly: true, //http통신에서만 쿠키 확인 가능 -> 클라이언트의 script에서 불가
            //    secure: true               //https에서만 쿠키 전달
        }
    });
}
;
module.exports = getSession;
