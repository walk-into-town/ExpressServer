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
exports.CampaignManager = void 0;
const FeatureManager_1 = require("./FeatureManager");
const CryptoJS = __importStar(require("crypto-js"));
class CampaignManager extends FeatureManager_1.FeatureManager {
    insert(params) {
        let hash = CryptoJS.SHA256(params.ownner + params.name + params.region);
        let id = hash.toString(CryptoJS.enc.Base64);
        this.res.locals.id = id;
        params.imgs.forEach(e => {
            console.log(e);
        });
        const run = () => __awaiter(this, void 0, void 0, function* () {
            let isValid; //입력받은 사용자 id, 핀포인트 id가 존재하는지 검증
            let result; //사용자 id 검증 후 전달을 위한 id
            let checkIdParams = {
                TableName: 'Member',
                Key: {
                    'id': params.ownner,
                },
            };
            function onCheckId(err, data) {
                if (err) {
                    isValid = false;
                    result = {
                        result: 'error',
                        error: 'DB Error Please Contect Manager'
                    };
                }
                else {
                    if (data.Item == undefined) {
                        isValid = false;
                        result = {
                            result: 'failed',
                            error: 'Invalid User'
                        };
                        return;
                    }
                    isValid = true;
                }
            }
            yield this.Dynamodb.get(checkIdParams, onCheckId.bind(this)).promise();
            let pinpoints = [];
            params.pinpoints.forEach(pinpoint => {
                pinpoints.push({ 'id': pinpoint });
            });
            let checkPinointParams = {
                RequestItems: {
                    'Pinpoint': {
                        Keys: pinpoints
                    }
                }
            };
            function onCheckPinoint(err, data) {
                if (err) {
                    isValid = false;
                    result = {
                        result: 'error',
                        error: 'DB Error Please Contect Manager'
                    };
                }
                else {
                    console.log;
                }
            }
            this.Dynamodb.batchGet(checkPinointParams);
            console.log(isValid);
            if (isValid == false) {
                this.res.status(400).send(result);
                return;
            }
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
                    coupons: params.coupons
                },
                ConditionExpression: "attribute_not_exists(id)" //항목 추가하기 전에 이미 존재하는 항목이 있을 경우 pk가 있을 때 조건 실패. pk는 반드시 있어야 하므로 replace를 방지
            };
            this.Dynamodb.put(queryParams, this.onInsert.bind(this));
        });
        run();
    }
    onInsert(err, data) {
        if (err) { //에러 발생
            let result = {
                result: 'failed',
                error: err
            };
            this.res.status(400).send(result);
        }
        else { //정상 처리
            let result = {
                "result": "success",
                "pinpointId": this.res.locals.id // DynamoDB에서는 insert시 결과 X. 따라서 임의로 생성되는 id를 전달하기 위해 locals에 id 추가
            };
            this.res.status(201).send(result);
        }
    }
    read(params, readType) {
        let index = null;
        let expAttrVals;
        switch (readType) {
            case FeatureManager_1.toRead.name:
                index = 'nameIndex';
                expAttrVals = {
                    '#name': readType
                };
                break;
            case FeatureManager_1.toRead.id:
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
        this.Dynamodb.query(params, this.onRead.bind(this));
    }
    onRead(err, data) {
        if (err) { //에러 발생
            let result = {
                result: 'failed',
                error: err
            };
            this.res.status(400).send(result);
        }
        else {
            let result = {
                result: 'success',
                message: data.Items
            };
            this.res.status(201).send(result);
        }
    }
    update(params) {
    }
    delete(params) {
    }
}
exports.CampaignManager = CampaignManager;
