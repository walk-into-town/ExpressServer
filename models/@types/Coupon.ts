export class Coupon{
    //attributes
    private _id: string
    private _description: string
    private _goods: string
    private _endDate: Date
    private _issued: number
    private _limit: number
    private _img: string

    //getters and setters
    public get id(): string {
        return this._id
    }
    public set id(value: string) {
        this._id = value
    }

    public get description(): string {
        return this._description
    }
    public set description(value: string) {
        this._description = value
    }

    public get goods(): string {
        return this._goods
    }
    public set goods(value: string) {
        this._goods = value
    }

    public get endDate(): Date {
        return this._endDate
    }
    public set endDate(value: Date) {
        this._endDate = value
    }

    public get issued(): number {
        return this._issued
    }
    public set issued(value: number) {
        this._issued = value
    }

    public get limit(): number {
        return this._limit
    }
    public set limit(value: number) {
        this._limit = value
    }

    public get img(): string {
        return this._img
    }
    public set img(value: string) {
        this._img = value
    }
}