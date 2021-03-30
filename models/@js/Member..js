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
    get pw() {
        return this._pw;
    }
    set pw(value) {
        this._pw = value;
    }
    get nickName() {
        return this._nickName;
    }
    set nickName(value) {
        this._nickName = value;
    }
    get profileImg() {
        return this._profileImg;
    }
    set profileImg(value) {
        this._profileImg = value;
    }
    get badge() {
        return this._badge;
    }
    set badge(value) {
        this._badge = value;
    }
    get coupons() {
        return this._coupons;
    }
    set coupons(value) {
        this._coupons = value;
    }
    get myCampaigns() {
        return this._myCampaigns;
    }
    set myCampaigns(value) {
        this._myCampaigns = value;
    }
    get playingCampaigns() {
        return this._playingCampaigns;
    }
    set playingCampaigns(value) {
        this._playingCampaigns = value;
    }
    get manager() {
        return this._manager;
    }
    set manager(value) {
        this._manager = value;
    }
}
exports.Campaign = Campaign;
