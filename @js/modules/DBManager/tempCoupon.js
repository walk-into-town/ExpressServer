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
const result_1 = require("../../static/result");
class CouponManager extends FeatureManager_1.FeatureManager {
    read(params, ReadType) {
        throw new Error("Method not implemented.");
    }
    update(params) {
        throw new Error("Method not implemented.");
    }
    delete(params) {
        throw new Error("Method not implemented.");
    }
    /**
     * ?????? ?????? ??????
     * 1. ????????? ?????? ?????? ?????? ????????? ???????????? ??????
     * 2. ?????? ????????? ????????? id ??????
     * 3. DB??? ??????
     * 4. ?????? ????????? ?????? ??????????????? ??????
     */
    insert(params) {
        let hash = CryptoJS.SHA256(Date().toString() + params.name + Math.random());
        let id = hash.toString(CryptoJS.enc.Base64);
        var queryParams = {
            TableName: 'Coupon',
            Item: {
                id: id,
                name: params.name,
                description: params.description,
                goods: params.goods,
                endDate: params.endDate,
                issued: 0,
                limit: Number(params.limit),
                imgs: params.img,
                paymentCondition: params.paymentCondition
            },
            ConditionExpression: "attribute_not_exists(id)" //?????? ???????????? ?????? ?????? ???????????? ????????? ?????? ?????? pk??? ?????? ??? ?????? ??????. pk??? ????????? ????????? ????????? replace??? ??????
        };
        const run = () => __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(`DB ?????? params\n${JSON.stringify(queryParams, null, 2)}`);
                let result = yield this.Dynamodb.put(queryParams).promise();
                this.res.locals.coupons.push(queryParams.Item);
                this.res.locals.cids.push(id);
                console.log(`?????? ??????,\n ????????? ?????? id : ${id}`);
                // let result = {
                //     result: 'success',
                //     message: {
                //         'id': id
                //     }
                // }
                // this.res.status(201).send(result)
            }
            catch (err) {
                for (const id of this.res.locals.cids) {
                    let deleteParams = {
                        TableName: 'Coupon',
                        Key: {
                            'id': id
                        }
                    };
                    yield this.Dynamodb.delete(deleteParams).promise();
                }
                result_1.fail.error = result_1.error.invalReq;
                result_1.fail.errdesc = err;
                this.res.status(521).send(result_1.fail);
            }
        });
        return run;
    }
}
exports.default = CouponManager;
