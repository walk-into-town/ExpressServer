"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pinpoint = void 0;
class Pinpoint {
    //getters and setters
    get id() {
        return this._id;
    }
    set id(value) {
        this._id = value;
    }
    get name() {
        return this._name;
    }
    set name(value) {
        this._name = value;
    }
    get imgs() {
        return this._imgs;
    }
    set imgs(value) {
        this._imgs = value;
    }
    get latitude() {
        return this._latitude;
    }
    set latitude(value) {
        this._latitude = value;
    }
    get longitude() {
        return this._longitude;
    }
    set longitude(value) {
        this._longitude = value;
    }
    get updateTime() {
        return this._updateTime;
    }
    set updateTime(value) {
        this._updateTime = value;
    }
    get quiz() {
        return this._quiz;
    }
    set quiz(value) {
        this._quiz = value;
    }
    get comments() {
        return this._comments;
    }
    set comments(value) {
        this._comments = value;
    }
}
exports.Pinpoint = Pinpoint;
