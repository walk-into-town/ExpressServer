import { FeatureManager, ReadType } from "./FeatureManager";
import * as bcrypt from 'bcrypt'

export class MemberManager extends FeatureManager{
    /**
     * 1. get을 통해 id의 pw만 가져온 후
     * 2. db의 비밀번호와 입력받은 비밀번호의 일치를 확인한 후
     * 3. 일치하는 경우 현재 시간 + id로 생성한 해시값을 토큰으로 넘겨줌
     */
    public login(params: any): void{
        let id = params.id
        let pw = params.pw
        let queryParams = {
            TableName : 'Member',
            Key : {
                'id' : id,
                },
            ProjectionExpression: 'pw'
        }
        this.Dynamodb.get(queryParams, function(err, data){
            let result
            if(err){
                result = {
                    result: 'failed',
                    error: err
                }
                this.res.status(400).send(result)
            }
            let dbpw = data.Item.pw
            bcrypt.compare(pw, dbpw).then(function(result){
                if(result == true){
                    let result = {
                        result: 'success'
                    }
                    bcrypt.hash(Date.now().toString() + params.id, 10, function(err, data){
                        bcrypt.hash(params.id + Date.now().toString(), 10).then(function(hash){
                            this.req.session.token = hash
                            console.log(this.req.session.token)
                        }.bind(this))
                        this.res.status(201).send(result)
                    }.bind(this))
                }
                else{
                    let result = {
                        result: 'failed',
                        error: 'Invalid Password'
                    }
                    this.res.status(400).send(result)
                }
            }.bind(this))
        }.bind(this))
    }

    private onLogin(err: object, data: any){

    }

    public insert(params: any): void {
        let pw; let saltRounds = 10
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
        run()
    }
    private onInsert(err: object, data: any): void{
        if(err){
            let result = {
                result: 'success',
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


    public read(params: any, readType: ReadType): void {
        throw new Error("Method not implemented.");
    }
    public update(params: any): void {
        throw new Error("Method not implemented.");
    }
    public delete(params: any): void {
        throw new Error("Method not implemented.");
    }
    
}