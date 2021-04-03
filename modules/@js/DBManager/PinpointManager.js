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
exports.PinpointManager = void 0;
const FeatureManager_1 = require("./FeatureManager");
const CryptoJS = __importStar(require("crypto-js"));
class PinpointManager extends FeatureManager_1.FeatureManager {
    insert(params) {
        let hash = CryptoJS.SHA256(params.name + params.latitude.toString() + params.longitude.toString());
        params.id = hash.toString(CryptoJS.enc.Base64);
        var dbParams = {
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
            ConditionExpression: "attribute_not_exists(id)"
        };
        this.id = params.id;
        let put = new Promise((r) => this.Dynamodb.put(dbParams, this.onInsert.bind(this)));
    }
    onInsert(err, data) {
        if (err) {
            this.res.status(400).send(err);
        }
        else {
            console.log(data);
            let resultstr = {
                "result": "success",
                "pinpointId": this.id
            };
            console.log(resultstr);
            this.res.status(201).send(JSON.stringify(resultstr));
        }
    }
    read(params, readType) {
        throw new Error("Method not implemented.");
    }
    update(params) {
        throw new Error("Method not implemented.");
    }
    delete(params) {
        throw new Error("Method not implemented.");
    }
}
exports.PinpointManager = PinpointManager;
