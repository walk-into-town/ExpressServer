export enum Type {
    Campaign = "Campaign Report",
    Pinpoint = "Pinpoint Report"
}

export class Report{
    //attributes
    private _id: string
    private _targetId: string
    private _userId: string
    private _description: string
    private _type: Type
    private _processed: boolean
    private _date: Date

    //getters and setters
    public get id(): string {
        return this._id
    }
    public set id(value: string) {
        this._id = value
    }

    public get targetId(): string {
        return this._targetId
    }
    public set targetId(value: string) {
        this._targetId = value
    }

    public get userId(): string {
        return this._userId
    }
    public set userId(value: string) {
        this._userId = value
    }

    public get description(): string {
        return this._description
    }
    public set description(value: string) {
        this._description = value
    }

    public get type(): Type {
        return this._type
    }
    public set type(value: Type) {
        this._type = value
    }

    public get processed(): boolean {
        return this._processed
    }
    public set processed(value: boolean) {
        this._processed = value
    }
    
    public get date(): Date {
        return this._date
    }
    public set date(value: Date) {
        this._date = value
    }
}