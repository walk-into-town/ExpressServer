import { FeatureManager } from "./FeatureManager";
import SessionManager from './SessionManager'
import * as bcrypt from 'bcrypt'


export default class MemberManager extends FeatureManager{
    /**
     * 회원가입 로직
     * 1. 입력한 pw를 bcrypt를 이용해 DB에 저장할 pw 생성
     * 2. 생성된 pw를 이용해 DB에 Insert
     * 3. ConditionExpression을 통해 id가 중복되는 경우 실패
     */
    public insert(params: any): void {
        let pw: string; let saltRounds = 10
        const run = async () => {
            await bcrypt.hash(params.pw, saltRounds).then(function(hash){
                pw = hash
              })
              var queryParams = {
                TableName: 'Member',
                Item: {
                    id: params.id,
                    pw: pw,
                    nickname: params.nickname,
                    isManager: params.isManager
                },
                ConditionExpression: "attribute_not_exists(id)"      //항목 추가하기 전에 이미 존재하는 항목이 있을 경우 pk가 있을 때 조건 실패. pk는 반드시 있어야 하므로 replace를 방지
            }
            this.Dynamodb.put(queryParams, this.onInsert.bind(this))
        }
        try{
            run()
        }
        catch(err){
            let result = {
                result: 'failed',
                error: 'DB Error! Please Contect Manager'
            }
            this.res.status(402).send(result)
        }
    }

    private onInsert(err: object, data: any): void{
        if(err){
            let result = {
                result: 'failed',
                error: err
            }
            this.res.status(400).send(result)
        }
        else{
            let result = {
                result: 'success',
                message: 'register success'
            }
            this.res.status(201).send(result)
        }
    }

    /**
     * logout 로직
     * 1. sessionManager에서 세션 id로 검색
     * 2. 검색 결과의 사용자 id가 입력받은 사용자의 id와 동일한지 검증
     * 3. 동일한 경우 세션 삭제
     * 4. 다른 경우 잘못된 접근 경고
     */
    public logout(params: any){
        let id = params.id
        let sessman = new SessionManager(this.req, this.res)
        const run = async() => {
            await sessman.findBySId(this.req.session.id)
            if(this.res.locals.result == undefined){
                let result = {
                    result: 'failed',
                    error: 'Please Login First'
                }
                this.res.status(400).send(result)
                return;
            }
            let json = JSON.parse(this.res.locals.result.sess)
            let findId = json.passport.user.id
            if(findId == id){
                this.req.session.destroy(() => {
                    this.req.session
                });
                let result = {
                    result: 'success',
                    message: params.id
                }
                this.res.status(200).send(result)
            }
            else{
                let result = {
                    result: 'failed',
                    error: 'Invalid UserID'
                }
                this.res.status(200).send(result)
            }
        }
        try{
            run()
        }
        catch(err){
            let result = {
                result: 'failed',
                error: err
            }
            this.res.status(402).send(result)
        }
    }

    public findMember(id: string){
        
    }

    public read(params: any): void {
        throw new Error("Method not implemented.");
    }
    public update(params: any): void {
        throw new Error("Method not implemented.");
    }
    public delete(params: any): void {
        throw new Error("Method not implemented.");
    }
    
    public check(type: string, params: any){
        let index = null
        let value = null
        switch(type){
            case 'id':
                value = params.id
                break;
            case 'nickname':
                index = 'nicknameIndex'
                value = params.nickname
                break;
            default:
                break;
        }
        params = {
            TableName: 'Member',
            IndexName: index,
            KeyConditionExpression: `${type} = :value`,
            ExpressionAttributeValues: {':value': value},
        }
        const run = async() => {
            let queryResult = await this.Dynamodb.query(params).promise()
            let result = {
                result: 'success',
                message: ''
            }
            if(queryResult.Items.length == 0){
                result.message = 'duplicated'
                this.res.status(201).send(result)
                return;
            }
            else{
                result.message = 'clear'
                this.res.status(201).send(result)
                return;
            }
        }
        try{
            run()
        }
        catch(err){
            let result = {
                result: 'failed',
                message: 'DB Error. Please Contect Manager'
            }
            this.res.status(400).send(result)
        }
    }
}