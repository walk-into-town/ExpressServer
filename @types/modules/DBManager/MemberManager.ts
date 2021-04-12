import { FeatureManager, ReadType } from "./FeatureManager";
import {SessionManager} from './SessionManager'
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
        let isIdValid: boolean
        let dbpw: string
        /**
         * 이미 로그인한 ID로 로그인을 시도하는지 확인
         */

        let test = new SessionManager(this.req, this.res)
        test.findById(id).then(function () {
            test.deleteSession(test.result)
        })   
        
        let queryParams = {
            TableName : 'Member',
            Key : {
                'id' : params.id,
                },
            ProjectionExpression: 'pw'
        }

        function onGet(err:object, data: any){
            let result
            if(err){                        //db에러 발생
                result = {
                    result: 'failed',
                    error: err
                }
                console.log('onget-err')
                this.res.status(400).send(result)
                isIdValid = false
                return;
            }
            if(data.Item == undefined){     //id와 일치하는 항목 없음
                result = {
                    result: 'failed',
                    error: 'Invalid User Id'
                }
                console.log('onget-undefined')
                this.res.status(400).send(result)
                isIdValid = false
                return;
            }
            else{               //일치하면 isIdValid = true, dbpw = pw
                console.log('onget-success')
                isIdValid = true
                dbpw = data.Item.pw
            }
        }

        function onCreteToken(err, hash){
            this.req.session.token = hash
            this.req.session.user = {
                id: params.id
            }
            this.req.session.save()
            let result = {
                result: 'success'
            }
            console.log('on-create-token')
            this.res.status(200).send(result)
        }
        const run = async () => {
            await this.Dynamodb.get(queryParams, onGet.bind(this)).promise()
            if(isIdValid == false){
                return;
            }
            const match = await bcrypt.compare(pw, dbpw)
            if(match == true){
                await bcrypt.hash(Date.now().toString() + params.id, 10).then(onCreteToken.bind(this))
            }else{
                let result = {
                    result: 'failed',
                    error: 'Password mismatch'
                }
                console.log('pwd missmatch')
                this.res.status(400).send(result)
            }
        }
        run()
        // this.Dynamodb.get(queryParams, function(err: object, data: any){    //DB에서 id에 맞는 pw를 가져오는 부분
        //     let result
        //     if(err){                            //가져오기 실패
        //         result = {
        //             result: 'failed',
        //             error: err
        //         }
        //         console.log(result)
        //         this.res.status(400).send(result)
        //         return;
        //     }
        //     if(data.Item == undefined){     //일치하는 id 없을 때
        //         let result = {
        //             result: 'failed',
        //             error: 'Invalid ID'
        //         }
        //         console.log(result)
        //         this.res.status(400).send(result)
        //         return;
        //     }
            
        //     let dbpw = data.Item.pw
        //     bcrypt.compare(pw, dbpw).then(function(result){         //일치하는 id를 찾고 입력받은 pw와 비교
        //         if(result == true){                                 //pw가 일치할 때, id + 현재 시각으로 토큰 발급
        //             bcrypt.hash(Date.now().toString() + params.id, 10, function(err, data){
        //                 bcrypt.hash(params.id + Date.now().toString(), 10).then(function(hash){
        //                     let result = {
        //                         result: 'success'
        //                     }
        //                     console.log(result)
        //                     this.req.session.token = hash
        //                     this.req.session.user = {
        //                         id: params.id
        //                     }
        //                     this.res.status(201).send(result)
        //                 }.bind(this))
        //             }.bind(this))
        //         }
        //         else{
        //             let result = {
        //                 result: 'failed',
        //                 error: 'Invalid Password'
        //             }
        //             console.log(result)
        //             this.res.status(400).send(result)
        //         }
        //     }.bind(this))
        // }.bind(this))
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