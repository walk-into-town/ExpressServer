"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeatureManager = exports.toRead = void 0;
const DBConnection_1 = __importDefault(require("./DBConnection"));
var toRead;
(function (toRead) {
    toRead["name"] = "name";
    toRead["region"] = "region";
    toRead["id"] = "id";
    toRead["ownner"] = "ownner";
})(toRead = exports.toRead || (exports.toRead = {}));
class FeatureManager {
    constructor(req, res) {
        let conn = new DBConnection_1.default();
        this.Dynamodb = conn.getDynamoDB();
        this.req = req;
        this.res = res;
    }
}
exports.FeatureManager = FeatureManager;
