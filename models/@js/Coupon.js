"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Coupon = void 0;
class Coupon {
    //getters and setters
    get id() {
        return this._id;
    }
    set id(value) {
        this._id = value;
    }
    get description() {
        return this._description;
    }
    set description(value) {
        this._description = value;
    }
    get goods() {
        return this._goods;
    }
    set goods(value) {
        this._goods = value;
    }
    get endDate() {
        return this._endDate;
    }
    set endDate(value) {
        this._endDate = value;
    }
    get issued() {
        return this._issued;
    }
    set issued(value) {
        this._issued = value;
    }
    get limit() {
        return this._limit;
    }
    set limit(value) {
        this._limit = value;
    }
    get img() {
        return this._img;
    }
    set img(value) {
        this._img = value;
    }
}
exports.Coupon = Coupon;
