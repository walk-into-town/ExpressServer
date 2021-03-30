export class Monster{
    //Attributes
    private _number: number
    private _image: Array<string>

    //getters and setters
    public get number(): number {
        return this._number
    }
    public set number(value: number) {
        this._number = value
    }
    public get image(): Array<string> {
        return this._image
    }
    public set image(value: Array<string>) {
        this._image = value
    }
}