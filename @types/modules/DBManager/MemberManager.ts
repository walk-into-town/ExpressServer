import { FeatureManager } from "./FeatureManager";
import SessionManager from './SessionManager'
import * as bcrypt from 'bcrypt'
import { error, fail, success } from "../../static/result";


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
            try{
                let checkparams = {
                    TableName: 'Member',
                    IndexName: 'nicknameIndex',
                    KeyConditionExpression: 'nickname = :value',
                    ExpressionAttributeValues: {':value': params.nickname},
                }
                let checkResult = await this.Dynamodb.query(checkparams).promise()
                console.log(checkResult.Items)
                if(checkResult.Items.length != 0){
                    fail.error = error.invalReq
                    fail.errdesc = '닉네임이 중복되었어요.'
                    this.res.status(400).send(fail)
                    return;
                }

                await bcrypt.hash(params.pw, saltRounds).then(function(hash){
                    pw = hash
                })
                var queryParams = {
                    TableName: 'Member',
                    Item: {
                        id: params.id,
                        pw: pw,
                        profileImg: process.env.domain + 'defaultProfileImg.jpg',
                        nickname: params.nickname,
                        isManager: params.isManager,
                        primeBadge: null,
                        badge: [],
                        coupons: [],
                        myCampaigns: [],
                        playingCampaigns: [],
                        selfIntroduction: '자기소개를 꾸며보세요.'
                    },
                    ConditionExpression: "attribute_not_exists(id)"      //항목 추가하기 전에 이미 존재하는 항목이 있을 경우 pk가 있을 때 조건 실패. pk는 반드시 있어야 하므로 replace를 방지
                }
                this.Dynamodb.put(queryParams, this.onInsert.bind(this))
            }
            catch(err){
                fail.error = error.dbError
                fail.errdesc = err
                this.res.status(402).send(fail)
            }
        }
        run()
    }

    private onInsert(err: object, data: any): void{
        if(err){
            fail.error = error.invalReq
            fail.errdesc = 'ID가 중복되었어요.'
            this.res.status(400).send(err)
        }
        else{
            success.data = '회원가입 성공'
            this.res.status(201).send(success)
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
            console.log(this.req.session.passport.user.id)
            let sessId = this.req.session.passport.user.id
            if(sessId == id){
                this.req.session.destroy(() => {
                    this.req.session
                })
                success.data = params.id
                console.log('로그아웃 성공')
                console.log(`응답 JSON\n${JSON.stringify(success, null, 2)}`)
                this.res.status(200).send(success)
                return;
            }
            fail.error = error.invalAcc
            fail.errdesc = '세션 정보와 일치하지 않습니다.'
            console.log(`ID와 세션 정보가 다릅니다.\n${JSON.stringify(fail, null, 2)}`)
        }
        run()
    }

    public findMember(id: string){
        
    }

    public read(params: any): void {
        let id = this.req.session.passport.user.id
        let queryParams = {
            TableName: 'Member',
            KeyConditionExpression: 'id = :id',
            ExpressionAttributeValues: {':id': id},
            ProjectionExpression: 'myCampaigns, playingCampaigns'
        }
        const run = async() => {
            try{
                let result = await this.Dynamodb.query(queryParams).promise()
                let myCampaign = result.Items[0].myCampaigns.length
                let playingCampaign = result.Items[0].playingCampaigns
                let participateCamp = []; let clearCamp = []
                playingCampaign.forEach(campaign => {
                    if(campaign.cleared == true){
                        clearCamp.push(campaign)
                    }
                    else{
                        participateCamp.push(campaign)
                    }
                });
                let data = {
                    playingCampaign: participateCamp.length,
                    myCampaign: myCampaign,
                    clearCampaign: clearCamp.length
                }
                success.data = data
                this.res.status(200).send(success)
            }
            catch(err){
                fail.error = error.dbError
                fail.errdesc = err
                this.res.status(400).send(fail)
            }
        }
        run()
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
            try{
                let queryResult = await this.Dynamodb.query(params).promise()
                if(queryResult.Items.length == 0){
                    success.data = '중복되었어요'
                    this.res.status(201).send(success)
                    return;
                }
                else{
                    success.data = '가능해요'
                    this.res.status(201).send(success)
                    return;
                }
            }
            catch(err){
                fail.error = error.dbError
                fail.errdesc = err
                this.res.status(400).send(fail)
            }
        }
        run()
    }
}