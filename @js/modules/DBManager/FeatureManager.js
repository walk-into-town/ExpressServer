"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeatureManager = exports.toRead = exports.ReadType = void 0;
const DBConnection_1 = require("./DBConnection");
var ReadType;
(function (ReadType) {
    ReadType["query"] = "query";
    ReadType["scan"] = "scan";
})(ReadType = exports.ReadType || (exports.ReadType = {}));
var toRead;
(function (toRead) {
    toRead["name"] = "name";
    toRead["region"] = "region";
    toRead["id"] = "id";
    toRead["ownner"] = "ownner";
})(toRead = exports.toRead || (exports.toRead = {}));
class FeatureManager {
    constructor(req, res) {
        let conn = new DBConnection_1.DBConnection();
        this.Dynamodb = conn.getDynamoDB();
        this.req = req;
        this.res = res;
    }
}
exports.FeatureManager = FeatureManager;
