"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Campaign = void 0;
class Campaign {
    //getters and setters
    get id() {
        return this._id;
    }
    set id(value) {
        this._id = value;
    }
    get owner() {
        return this._owner;
    }
    set owner(value) {
        this._owner = value;
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
    get description() {
        return this._description;
    }
    set description(value) {
        this._description = value;
    }
    get updateTime() {
        return this._updateTime;
    }
    set updateTime(value) {
        this._updateTime = value;
    }
    get region() {
        return this._region;
    }
    set region(value) {
        this._region = value;
    }
    get pinpoints() {
        return this._pinpoints;
    }
    set pinpoints(value) {
        this._pinpoints = value;
    }
    get coupons() {
        return this._coupons;
    }
    set coupons(value) {
        this._coupons = value;
    }
    get comments() {
        return this._comments;
    }
    set comments(value) {
        this._comments = value;
    }
}
exports.Campaign = Campaign;
