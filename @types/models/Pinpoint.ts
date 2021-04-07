export class Pinpoint{
    //attributes
    private _id: string
    private _name: string
    private _imgs: Array<string>
    private _latitude: number
    private _longitude: number
    private _updateTime: Date
    private _quiz: object
    private _comments: Array<object>

    //getters and setters
    public get id(): string {
        return this._id
    }
    public set id(value: string) {
        this._id = value
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
    
    public get latitude(): number {
        return this._latitude
    }
    public set latitude(value: number) {
        this._latitude = value
    }
    
    public get longitude(): number {
        return this._longitude
    }
    public set longitude(value: number) {
        this._longitude = value
    }
    
    public get updateTime(): Date {
        return this._updateTime
    }
    public set updateTime(value: Date) {
        this._updateTime = value
    }
    
    public get quiz(): object {
        return this._quiz
    }
    public set quiz(value: object) {
        this._quiz = value
    }
    
    public get comments(): Array<object> {
        return this._comments
    }
    public set comments(value: Array<object>) {
        this._comments = value
    }
}