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
const DBConnection_1 = __importDefault(require("./DBConnection"));
const bcrypt = __importStar(require("bcrypt"));
class SocialRegister {
    insert(params) {
        let dbConn = new DBConnection_1.default();
        let dynamodb = dbConn.getDynamoDB();
        let pw;
        let saltRounds = 10;
        const run = () => __awaiter(this, void 0, void 0, function* () {
            yield bcrypt.hash(params.pw, saltRounds).then(function (hash) {
                pw = hash;
            });
            var queryParams = {
                TableName: 'Member',
                Item: {
                    id: params.id,
                    pw: pw,
                    profileImg: params.profileImg,
                    nickname: params.nickname,
                    isManager: params.isManager,
                    primeBadge: null,
                    badge: [],
                    coupons: [],
                    myCampaigns: [],
                    playingCampaigns: [],
                    selfIntroduction: '??????????????? ???????????????.'
                },
                ConditionExpression: "attribute_not_exists(id)" //?????? ???????????? ?????? ?????? ???????????? ????????? ?????? ?????? pk??? ?????? ??? ?????? ??????. pk??? ????????? ????????? ????????? replace??? ??????
            };
            yield dynamodb.put(queryParams).promise();
        });
        return run();
    }
}
exports.default = SocialRegister;
