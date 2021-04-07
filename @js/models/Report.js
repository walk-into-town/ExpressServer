"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Report = exports.Type = void 0;
var Type;
(function (Type) {
    Type["Campaign"] = "Campaign Report";
    Type["Pinpoint"] = "Pinpoint Report";
})(Type = exports.Type || (exports.Type = {}));
class Report {
    //getters and setters
    get id() {
        return this._id;
    }
    set id(value) {
        this._id = value;
    }
    get targetId() {
        return this._targetId;
    }
    set targetId(value) {
        this._targetId = value;
    }
    get userId() {
        return this._userId;
    }
    set userId(value) {
        this._userId = value;
    }
    get description() {
        return this._description;
    }
    set description(value) {
        this._description = value;
    }
    get type() {
        return this._type;
    }
    set type(value) {
        this._type = value;
    }
    get processed() {
        return this._processed;
    }
    set processed(value) {
        this._processed = value;
    }
    get date() {
        return this._date;
    }
    set date(value) {
        this._date = value;
    }
}
exports.Report = Report;
