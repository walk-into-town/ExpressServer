"use strict";
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
exports.SessionManager = void 0;
const DBConnection_1 = require("./DBConnection");
class SessionManager {
    constructor(req, res) {
        this._result = [];
        let conn = new DBConnection_1.DBConnection();
        this.Dynamodb = conn.getDynamoDB();
        this.req = req;
        this.res = res;
    }
    get result() {
        return this._result;
    }
    isSessionValid() {
        if (this.req.session.user == undefined) {
            return false;
        }
        return true;
    }
    findById(id) {
        let queryParams = {
            TableName: 'Session',
            ProjectionExpression: 'sess, id'
        };
        const run = () => __awaiter(this, void 0, void 0, function* () {
            yield this.Dynamodb.scan(queryParams, this.onFindById.bind(this)).promise().then(() => {
                this.findResult.forEach(element => {
                    let json = JSON.parse(element.sess);
                    if (json.user.id == id) {
                        this._result.push(element);
                    }
                });
            });
        });
        return run();
    }
    onFindById(err, data) {
        if (err) {
            console.log('error');
        }
        else {
            this.findResult = data.Items;
        }
    }
    deleteSession(id) {
        for (let i = 0; i < id.length; i++) { //순차 처리를 위해서 foreach대신 for문 사용
            console.log(i);
            let queryParams = {
                TableName: 'Session',
                Key: {
                    'id': id[i].id
                }
            };
            const run = () => __awaiter(this, void 0, void 0, function* () {
                yield this.Dynamodb.delete(queryParams, this.onDeleteSession.bind(this)).promise();
            });
            run();
        }
    }
    onDeleteSession(err, data) {
        if (err) {
            console.log(err);
        }
    }
}
exports.SessionManager = SessionManager;
