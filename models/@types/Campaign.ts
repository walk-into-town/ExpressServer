export class Campaign{
    //attributes
    private _id: string
    private _owner: string
    private _name: string
    private _imgs: Array<string>
    private _description: string
    private _updateTime: Date
    private _region: string
    private _pinpoints: Array<string>
    private _coupons: Array<string>
    private _comments: Array<object>
    
    //getters and setters
    public get id(): string {
        return this._id;
    }
    public set id(value: string) {
        this._id = value;
    }

    public get owner(): string {
        return this._owner
    }
    public set owner(value: string) {
        this._owner = value
    }

    public get name(): string {
        return this._name
    }
    public set name(value: string) {
        this._name = value
    }

    public get imgs(): Array<string> {
        return this._imgs
    }
    public set imgs(value: Array<string>) {
        this._imgs = value
    }

    public get description(): string {
        return this._description
    }
    public set description(value: string) {
        this._description = value
    }

    public get updateTime(): Date {
        return this._updateTime
    }
    public set updateTime(value: Date) {
        this._updateTime = value
    }
    
    public get region(): string {
        return this._region
    }
    public set region(value: string) {
        this._region = value
    }
    
    public get pinpoints(): Array<string> {
        return this._pinpoints
    }
    public set pinpoints(value: Array<string>) {
        this._pinpoints = value
    }

    public get coupons(): Array<string> {
        return this._coupons
    }
    public set coupons(value: Array<string>) {
        this._coupons = value
    }

    public get comments(): Array<object> {
        return this._comments
    }
    public set comments(value: Array<object>) {
        this._comments = value
    }
}