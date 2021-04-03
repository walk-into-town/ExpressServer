"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeatureManager = exports.ReadType = void 0;
const DBConnection_1 = require("./DBConnection");
var ReadType;
(function (ReadType) {
    ReadType["query"] = "query";
    ReadType["scan"] = "scan";
})(ReadType = exports.ReadType || (exports.ReadType = {}));
class FeatureManager {
    constructor(req) {
        this.Dynamodb = DBConnection_1.DBConnection.getDynamoDB();
        this.req = req;
    }
}
exports.FeatureManager = FeatureManager;
