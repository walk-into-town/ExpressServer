import {DBConnection} from './DBConnection'
import * as aws from 'aws-sdk'
import * as express from 'express'

export class SessionManager {
    private _result = []
    public get result() {
        return this._result
    }
    private findResult
    protected Dynamodb: aws.DynamoDB.DocumentClient
    protected req: express.Request
    protected res: express.Response
    constructor(req: express.Request, res: express.Response){
        this.Dynamodb = DBConnection.getDynamoDB()
        this.req = req
        this.res = res
    }

    public isSessionValid(): boolean{
        if(this.req.session.user == undefined){
            return false
        }
        return true
    }

    public findById(id: string){
        let queryParams = {
            TableName: 'Session',
            ProjectionExpression: 'sess, id'
        }
        const run = async () => {
            await this.Dynamodb.scan(queryParams, this.onFindById.bind(this)).promise().then(() => {
                this.findResult.forEach(element => {
                    let json = JSON.parse(element.sess)
                    if(json.user.id == id){
                        this._result.push(element)
                    }
                });
            })
        }
        return run();
    }
    private onFindById(err: object, data: any){
        if(err){
            console.log('error')
        }
        else{
            this.findResult = data.Items
        }
    }

    public deleteSession(id: Array<any>) {      //세션 지우기. 기존에 로그인된 세션을 DB에서 삭제 -> 세션이 없으므로 에러 발생
        for(let i =0; i < id.length; i++) {    //순차 처리를 위해서 foreach대신 for문 사용
            console.log(i)
            let queryParams = {
                TableName: 'Session',
                Key: {
                    'id': id[i].id
                }
            }
            const run = async () => {
                await this.Dynamodb.delete(queryParams, this.onDeleteSession.bind(this)).promise()
            }
            run()
        }
    }
    private onDeleteSession(err: object, data: any){
        if(err){
            console.log(err)
        }
    }
}