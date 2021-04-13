import {DBConnection} from './DBConnection'
import * as aws from 'aws-sdk'
import * as express from 'express'

export class SessionManager {
    protected Dynamodb: aws.DynamoDB.DocumentClient
    protected req: express.Request
    protected res: express.Response
    constructor(req: express.Request, res: express.Response){
        let conn = new DBConnection()
        this.Dynamodb = conn.getDynamoDB()
        this.req = req
        this.res = res
    }

    public isSessionValid(): boolean{
        if(this.req.session.user == undefined){
            return false
        }
        return true
    }

    /**
     * 사용자 id로 찾기 로직
     * 1. Session 스캔
     * 2. 찾은 값에 대하여 id와 일치하는 세션을 result에 넣기
     * 3. res.locals.result에 찾은 결과 넣기
     */
    public findByUId(id: string){
        let queryParams = {
            TableName: 'Session',
            ProjectionExpression: 'sess, id'
        }
        const run = async () => {
            try{
                this.res.locals.result = []
                const result = await this.Dynamodb.scan(queryParams).promise()
                result.Items.forEach(session => {
                    let json = JSON.parse(session.sess)
                    if(json.user == undefined){
                        return;
                    }
                    if(json.user.id == id){
                        this.res.locals.result.push(session)
                    }
                })
            }
            catch(err){
                let result = {
                    result: 'failed',
                    error: 'User Id Search Failed'
                }
                this.res.status(400).send(result)
                return;
            }
        }
        return run();
    }

    /**
     * 세션 ID로 찾기 로직
     * 1. Session 쿼리
     * 2. 일치하는 항목은 1개 뿐이므로 Items[0]을 전달
     */
    public findBySId(id: string){
        let sid = `sess:${id}`
        let queryParams = {
            TableName: 'Session',
            KeyConditionExpression: '#id = :id',
            ExpressionAttributeNames: {
                '#id' : 'id'
            },
            ExpressionAttributeValues: {
                ':id' : sid
            },
            ProjectionExpression: 'sess, #id'
        }
        const run = async () => {
            try{
                const result = await this.Dynamodb.query(queryParams).promise()
                this.res.locals.result = result.Items[0]
            }
            catch(err){
                let result = {
                    result: 'failed',
                    error: 'Session Id Search Failed'
                }
                this.res.status(400).send(result)
                return;
            }
        }
        return run()
    }

    /**
     * 로그인된 세션 삭제 로직
     * => 로그인 할 때 이미 로그인된 세션을 삭제할때만 호출됨
     *    다른 곳에서 호출 금지
     * 1. 입력받은 id를 이용해 세션 삭제
     * 2. 비동기 처리를 위해 forEach대신 for문 사용
     */
    public deleteSession(id: Array<any>) {
        for(let i =0; i < id.length; i++) {
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