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
const CryptoJS = __importStar(require("crypto-js"));
class PinpointManager extends FeatureManager_1.FeatureManager {
    /**
     * 핀포인트 API
     */
    /**
     * 핀포인트 등록 로직
     * 1. 핀포인트 이름, 위/경도로 hash id 생성
     * 2. 해당 id를 이용해 DB Insert
     * 3. ConditionExpression을 통해 id가 중복되면 실패
     */
    insert(params) {
        let hash = CryptoJS.SHA256(params.name + params.latitude.toString() + params.longitude.toString()); //id 중복 방지 + 이름과 위치가 같은 핀포인트 중복 방지
        params.id = hash.toString(CryptoJS.enc.Base64);
        var checkCouponParams = {
            TableName: 'Coupon',
            KeyConditionExpression: 'id = :id',
            ExpressionAttributeValues: {
                ':id': params.coupon
            }
        };
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
                quiz: params.quiz,
                coupon: params.coupon
            },
            ConditionExpression: "attribute_not_exists(id)" //항목 추가하기 전에 이미 존재하는 항목이 있을 경우 pk가 있을 때 조건 실패. pk는 반드시 있어야 하므로 replace를 방지
        };
        const run = () => __awaiter(this, void 0, void 0, function* () {
            let checkCoupon = yield this.Dynamodb.query(checkCouponParams).promise();
            if (checkCoupon.Items[0] == undefined) { //data.Item == undefined -> 해당하는 ID가 없음
                let result = {
                    result: 'failed',
                    error: 'Invalid Coupon'
                };
                this.res.status(400).send(result);
                return;
            }
            this.res.locals.id = params.id;
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
    /**
     * 핀포인트 조회 로직
     * batchGet을 사용 -> 핀포인트 목록조회와 일반 조회 모두 같은 함수로 통일
     * 1. batchget을 통해 DB에서 핀포인트를 가져옴
     * 2. 사용자에게 전달
     */
    read(params) {
        console.log(params);
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
                    "error": "DB Error. Please Contect Manager"
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
    /**
     * 핀포인트 수정 로직
     * 1. 핀포인트 update수행
     * 2. 성공 /실패 메시지 전달
     */
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
    /**
     * 핀포인트 삭제 로직
     * 1. 사용자 입력 값으로 핀포인트 삭제
     * 2. ReturnValues를 통해 삭제 전 항목을 받아
     * 3. 사용자에게 전달
     */
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
    /**
     * 핀포인트 상세 조회 로직
     * 1. 사용자로부터 입력받은 값으로 get 수행
     * 2. ProjectionExpression을 통해 상세 설명만 가져옴
     * 3. 사용자에게 전달
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
    /**
     * 핀포인트 상세정보 수정 로직
     * 1. 사용자로부터 값 받기
     * 2. ConditionExpression을 통해 이미 존재하는 핀포인트에 대해서만 수행
     *    => DynamoDB에서는 일치하는 Key가 없는 경우 자동으로 Insert
     * 3. 사용자에게 결과 전달
     */
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
    /**
     * 퀴즈 등록 로직
     * 1. 사용자로부터 값 받음
     * 2. RetrunValues를 통해 생성된 값 + ConditionExpression을 통해 없는 항목에만 등록
     * 3. 사용자에게 결과 전달
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
    /**
     * 퀴즈 조회 로직
     * 1. 사용자로부터 값 수신
     * 2. ProjectionExpression을 통해 퀴즈만 가져옴
     * 3. 사용자에게 전달
     */
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
    /**
     * 퀴즈 수정 로직
     * 1. 사용자로부터 값 수신
     * 2. ReturnValues를 통해 새로 생성된 항목 받기
     * 3. ConditionExpression을 통해 이미 존재하는 항목만 수정
     * 4. 사용자에게 결과 전달
     */
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
exports.default = PinpointManager;
