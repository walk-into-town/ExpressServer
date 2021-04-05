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
exports.PinpointManager = void 0;
const FeatureManager_1 = require("./FeatureManager");
const CryptoJS = __importStar(require("crypto-js"));
class PinpointManager extends FeatureManager_1.FeatureManager {
    insert(params) {
        let hash = CryptoJS.SHA256(params.name + params.latitude.toString() + params.longitude.toString()); //id 중복 방지 + 이름과 위치가 같은 핀포인트 중복 방지
        params.id = hash.toString(CryptoJS.enc.Base64);
        var queryParams = {
            TableName: 'Pinpoint',
            Item: {
                id: params.id,
                name: params.name,
                imgs: params.imgs,
                latitude: params.latitude,
                longitude: params.longitude,
                updateTime: params.updateTime,
                description: params.description,
                quiz: params.quiz
            },
            ConditionExpression: "attribute_not_exists(id)" //항목 추가하기 전에 이미 존재하는 항목이 있을 경우 pk가 있을 때 조건 실패. pk는 반드시 있어야 하므로 replace를 방지
        };
        this.res.locals.id = params.id;
        this.Dynamodb.put(queryParams, this.onInsert.bind(this));
    }
    onInsert(err, data) {
        if (err) {
            let result = {
                result: 'failed',
                error: err
            };
            this.res.status(400).send(result);
        }
        else {
            let resultstr = {
                "result": "success",
                "pinpointId": this.res.locals.id
            };
            this.res.status(201).send(resultstr);
        }
    }
    read(params, readType) {
        var queryParams = {
            RequestItems: {
                'Pinpoint': {
                    Keys: params
                }
            }
        };
        const run = () => __awaiter(this, void 0, void 0, function* () {
            yield this.Dynamodb.batchGet(queryParams, this.onRead.bind(this)).promise();
            if (this.res.locals.UnprocessedKeys != undefined) {
                let fail = {
                    "result": 'failed',
                    "error": "AWS Internal Server Error"
                };
                this.res.status(400).send(fail);
            }
            this.res.status(201).send(this.res.locals.result.Responses.Pinpoint);
        });
        run();
    }
    onRead(err, data) {
        if (err) {
            let result = {
                result: 'failed',
                error: err
            };
            this.res.status(400).send(result);
        }
        else {
            data.Responses.Pinpoint.result = "success";
            this.res.locals.result = data;
        }
    }
    update(params) {
        var queryParams = {
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
            let result = {
                result: 'failed',
                error: err
            };
            this.res.status(400).send(result);
        }
        else {
            data.Attributes.result = 'success';
            this.res.status(201).send(data.Attributes);
        }
    }
    delete(params) {
        var queryParams = {
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
            let result = {
                result: 'failed',
                error: err
            };
            this.res.status(401).send(result);
        }
        else {
            data.Attributes.result = 'success';
            this.res.status(200).send(data.Attributes);
        }
    }
    readDetail(params) {
        var queryParams = {
            TableName: 'Pinpoint',
            Key: {
                'id': params.id
            },
            ProjectionExpression: 'description'
        };
        this.Dynamodb.get(queryParams, this.onReadDetail.bind(this));
    }
    onReadDetail(err, data) {
        console.log(data);
        if (data.Item == undefined) {
            let result = {
                'result': 'failed',
                'error': 'Provided Key does not match'
            };
            this.res.status(400).send(result);
        }
        else {
            data.Item.result = 'success';
            this.res.status(201).send(data.Item);
        }
    }
    deleteDetail(params) {
        var queryParams = {
            TableName: 'Pinpoint',
            Key: { id: params.id },
            UpdateExpression: 'set description = :newdesc',
            ExpressionAttributeValues: { ':newdesc': '' },
            ReturnValues: 'UPDATED_NEW',
            ConditionExpression: "attribute_exists(id)"
        };
        this.Dynamodb.update(queryParams, this.onDeleteDetail.bind(this));
    }
    onDeleteDetail(err, data) {
        if (err) {
            let result = {
                result: 'failed',
                error: err
            };
            this.res.status(400).send(result);
        }
        else {
            data.Attributes.result = 'success';
            this.res.status(201).send(data.Attributes);
        }
    }
}
exports.PinpointManager = PinpointManager;
