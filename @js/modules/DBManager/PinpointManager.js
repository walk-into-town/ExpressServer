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
    /**
     * 핀포인트 API
     */
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
        var queryParams = {
            RequestItems: {
                'Pinpoint': {
                    Keys: params
                }
            }
        };
        const run = () => __awaiter(this, void 0, void 0, function* () {
            yield this.Dynamodb.batchGet(queryParams, this.onRead.bind(this)).promise(); // read를 수행할때 까지 대기
            if (this.res.locals.UnprocessedKeys != undefined) { //오류 발생 처리
                let result = {
                    "result": 'failed',
                    "error": "AWS Internal Server Error"
                };
                this.res.status(400).send(result);
            }
            let result = {
                'result': 'success',
                'message': this.res.locals.result.Pinpoint
            };
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
            let result = {
                'result': 'success',
                'message': data.Attributes
            };
            this.res.status(201).send(result);
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
                'result': 'failed',
                'error': err
            };
            this.res.status(401).send(result);
        }
        else {
            let result = {
                'result': 'success',
                'message': data.Attributes
            };
            this.res.status(200).send(result);
        }
    }
    /**
     * 핀포인트 상세 정보 API
     */
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
            let result = {
                'result': 'success',
                'message': data.Item
            };
            this.res.status(201).send(result);
        }
    }
    updateDetail(params) {
        var queryParams = {
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
            let result = {
                result: 'failed',
                error: err
            };
            this.res.status(400).send(result);
        }
        else {
            let result = {
                'result': 'success',
                'message': data.Attributes
            };
            this.res.status(201).send(result);
        }
    }
    /**
     * 핀포인트 퀴즈 API
     */
    insertQuiz(params) {
        var queryParams = {
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
            let result = {
                'result': 'failed',
                'error': err
            };
            this.res.status(400).send(result);
        }
        else {
            let result = {
                'result': 'success',
                'message': data.Attributes
            };
            this.res.status(201).send(result);
        }
    }
    readQuiz(params) {
        var queryParams = {
            TableName: 'Pinpoint',
            Key: {
                'id': params.id
            },
            ProjectionExpression: 'quiz'
        };
        this.Dynamodb.get(queryParams, this.onReadQuiz.bind(this));
    }
    onReadQuiz(err, data) {
        if (err) {
            let result = {
                'result': 'failed',
                'error': err
            };
            this.res.status(400).send(result);
        }
        else {
            let result = {
                'result': 'success',
                'message': data.Item
            };
            this.res.status(201).send(result);
        }
    }
    updateQuiz(params) {
        var queryParams = {
            TableName: 'Pinpoint',
            Key: { id: params.id },
            UpdateExpression: 'set quiz = :quiz',
            ExpressionAttributeValues: { ':quiz': params.quiz },
            ReturnValues: 'UPDATED_NEW',
            ConditionExpression: "attribute_exists(id)"
        };
        this.Dynamodb.update(queryParams, this.onUpdateQuiz.bind(this));
    }
    onUpdateQuiz(err, data) {
        if (err) {
            let result = {
                result: 'failed',
                error: err
            };
            this.res.status(400).send(result);
        }
        else {
            let result = {
                'result': 'success',
                'message': data.Attributes
            };
            this.res.status(201).send(result);
        }
    }
}
exports.PinpointManager = PinpointManager;
