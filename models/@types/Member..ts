export class Campaign{
    //attributes
    private _id: string
    private _pw: string
    private _nickName: string
    private _profileImg: Array<string>
    private _badge: Array<object>
    private _coupons: Array<object>
    private _myCampaigns: Array<string>
    private _playingCampaigns: Array<object>
    private _manager: boolean
    
    //getters and setters
    public get id(): string {
        return this._id;
    }
    public set id(value: string) {
        this._id = value;
    }

    public get pw(): string {
        return this._pw
    }
    public set pw(value: string) {
        this._pw = value
    }

    public get nickName(): string {
        return this._nickName
    }
    public set nickName(value: string) {
        this._nickName = value
    }

    public get profileImg(): Array<string> {
        return this._profileImg
    }
    public set profileImg(value: Array<string>) {
        this._profileImg = value
    }

    public get badge(): Array<object> {
        return this._badge
    }
    public set badge(value: Array<object>) {
        this._badge = value
    }

    public get coupons(): Array<object> {
        return this._coupons
    }
    public set coupons(value: Array<object>) {
        this._coupons = value
    }

    public get myCampaigns(): Array<string> {
        return this._myCampaigns
    }
    public set myCampaigns(value: Array<string>) {
        this._myCampaigns = value
    }

    public get playingCampaigns(): Array<object> {
        return this._playingCampaigns
    }
    public set playingCampaigns(value: Array<object>) {
        this._playingCampaigns = value
    }
    
    public get manager(): boolean {
        return this._manager
    }
    public set manager(value: boolean) {
        this._manager = value
    }
    
}