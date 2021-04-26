import { FeatureManager } from "./FeatureManager";
import SessionManager from './SessionManager'
import * as bcrypt from 'bcrypt'


export default class MemberManager extends FeatureManager{
    /**
     * 로그인 로직
     * 1. get을 통해 id의 pw만 가져온 후
     * 2. db의 비밀번호와 입력받은 비밀번호의 일치를 확인한 후
     * 3. 일치하는 경우 현재 시간 + id로 생성한 해시값을 토큰으로 넘겨줌
     */
    public login(params: any): void{
        let id = params.id
        let returnuser: any
        let pw = params.pw
        let isIdValid: boolean
        let dbpw: string
        /**
         * id가 일치하는지 확인
         */
        function onGet(err:object, data: any){
            let result
            if(err){                        //db에러 발생
                result = {
                    result: 'failed',
                    error: err
                }
                this.res.status(400).send(result)
                isIdValid = false
                return;
            }
            if(data.Item == undefined){     //id와 일치하는 항목 없음
                result = {
                    result: 'failed',
                    error: 'Invalid User Id'
                }
                this.res.status(400).send(result)
                isIdValid = false
                return;
            }
            else{               //일치하면 isIdValid = true, dbpw = pw
                isIdValid = true
                returnuser = {
                    profileimg: data.Item.profileImg,
                    nickname: data.Item.nickname,
                    selfIntroduction: data.Item.selfIntroduction
                }
                dbpw = data.Item.pw
            }
        }
        /**
         * 토큰 생성 처리 
         */
        function onCreteToken(err, hash){
            this.req.session.token = hash       //세션의 토큰에 생성된 토큰
            this.req.session.user = {           //세션의 사용자 정보에 id추가
                id: params.id
            }
            this.req.session.save()
            let result = {
                result: 'success',
                message: returnuser
            }
            this.res.status(200).send(result)
        }
        let queryParams = {
            TableName : 'Member',
            Key : {
                'id' : params.id,
            }
        }

        /**
         * 비동기 처리
         * 상기한 내용대에 따라 순서대로 처리
         */
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
                this.res.status(400).send(result)
            }
        }
        //run()
        const test = async() => {
            let data = await this.Dynamodb.get(queryParams).promise()
            if(data.Item == undefined){
                let result = {
                    result: 'failed',
                    error: 'Invalid User Id'
                }
                this.res.status(400).send(result)
                return;
            }
            const match = await bcrypt.compare(pw, data.Item.pw)
            if(match == true){
                this.req.session.user = data.Item.id
                let user = {
                    profileimg: data.Item.profileImg,
                    nickname: data.Item.nickname,
                    selfIntroduction: data.Item.selfIntroduction
                }
                let result = {
                    result: 'success',
                    message: user
                }
                this.res.status(200).send(result)
                return;
            }
        }
        try{
            test();
        }
        catch(err){
            let result = {
                result: 'failed',
                error: err
            }
            this.res.status(400).send(result)
            isIdValid = false
            return;
        }
    }

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
            let findId = json.user.id
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
        run()
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