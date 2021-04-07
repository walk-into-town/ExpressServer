export class Ranking{
    //attributes
    private _rank: number;
    private _userId: string;

    //getters and setters
    public get rank(): number {
        return this._rank;
    }
    public set rank(value: number) {
        this._rank = value;
    }
    public get userId(): string {
        return this._userId;
    }
    public set userId(value: string) {
        this._userId = value;
    }
}