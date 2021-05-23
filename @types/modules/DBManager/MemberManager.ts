import { FeatureManager } from "./FeatureManager";
import SessionManager from './SessionManager'
import * as bcrypt from 'bcrypt'
import { error, fail, success } from "../../static/result";
import {nbsp2plus} from '../Logics/nbsp'

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
                let nicknameCheckparams = {
                    TableName: 'Member',
                    IndexName: 'nicknameIndex',
                    KeyConditionExpression: 'nickname = :value',
                    ExpressionAttributeValues: {':value': params.nickname},
                }
                let nicknameCheckResult = await this.Dynamodb.query(nicknameCheckparams).promise()
                console.log(nicknameCheckResult.Items)
                if(nicknameCheckResult.Items.length != 0){
                    fail.error = error.invalReq
                    fail.errdesc = '닉네임이 중복되었어요.'
                    this.res.status(400).send(fail)
                    return;
                }

                let idCheckParams = {
                    TableName: 'Member',
                    KeyConditionExpression: 'id = :id',
                    ExpressionAttributeValues: {':id': params.id}
                }
                let idCheckResult = await this.Dynamodb.query(idCheckParams).promise()
                console.log(idCheckResult.Items)
                if(idCheckResult.Items.length != 0){
                    fail.error = error.invalReq
                    fail.errdesc = '아이디가 중복되었어요.'
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
                this.res.status(521).send(fail)
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
            fail.errdesc = '잘못된 접근입니다.'
            console.log(`ID와 세션 정보가 다릅니다.\n${JSON.stringify(fail, null, 2)}`)
            this.res.status(400).send(fail)
            return;
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
                this.res.status(521).send(fail)
            }
        }
        run()
    }
    public update(params: any): void {
        let uid = this.req.session.passport.user.id
        if(uid != params.id){
            fail.error = error.invalAcc
            fail.errdesc = '잘못된 접근입니다.'
            this.res.status(400).send(fail)
            return;
        }
        let profileImg = params.imgs
        let nickname = params.nickname
        let selfIntroduction = params.selfIntroduction
        let updateExp: string = 'SET '
        let expAttrVal: any = {}

        let updateParams = {
            TableName: 'Member',
            Key: {id: params.id},
            UpdateExpression: null,
            ExpressionAttributeValues: null,
            RetrunValues: 'ALL_NEW',
            ConditionExpression: 'attribute_exists(id)'
        }
        const run = async() => {
            try{
                if(profileImg != ''){
                    updateExp += 'profileImg = :profileImg '
                    expAttrVal[":profileImg"] = profileImg
                }
                if(nickname != ''){
                    let checkParams = {
                        TableName: 'Member',
                        IndexName: 'nicknameIndex',
                        KeyConditionExpression: `nickname = :value`,
                        ExpressionAttributeValues: {':value': params.nickname}
                    }
                    console.log('닉네임 중복 여부 확인중...')
                    let queryResult = await this.Dynamodb.query(checkParams).promise()
                    if(queryResult.Items.length != 0){
                        success.data = '닉네임이 중복되었어요'
                        this.res.status(200).send(success)
                        return;
                    }
                    console.log(`닉네임 중복 통과.\nUpdate 쿼리 작성중`)
                    if(updateExp.length == 4){
                        updateExp += 'nickname = :nickname '
                        expAttrVal[':nickname'] = nickname
                    }
                    else{
                        updateExp += ', nickname = :nickname '
                        expAttrVal[':nickname'] = nickname
                    }
                }
                if(selfIntroduction != ''){
                    if(updateExp.length == 4){
                        updateExp += 'selfIntroduction = :selfIntroduction'
                        expAttrVal[':selfIntroduction'] = selfIntroduction
                    }
                    else{
                        updateExp += ', selfIntroduction = :selfIntroduction'
                        expAttrVal[':selfIntroduction'] = selfIntroduction
                    }
                }
                updateParams.UpdateExpression = updateExp
                updateParams.ExpressionAttributeValues = expAttrVal
                console.log(`쿼리 작성 완료. 작성된 쿼리\n${JSON.stringify(updateParams, null, 2)}`)
                console.log('회원정보 수정중')
                let result = await this.Dynamodb.update(updateParams).promise()
                console.log(`회원정보 수정 성공.${JSON.stringify(result, null, 2)}`)
                success.data = {profileImg}
                this.res.status(200).send(success)
            }
            catch(err){
                fail.error = error.dbError
                fail.errdesc = err
                this.res.status(521).send(fail)
            }
        }
        run()
    }

    public delete(params: any): void {
        throw new Error("Method not implemented.");
    }
    
    public check(type: string, params: any): void{
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
            ExpressionAttributeValues: {':value': value}
        }
        const run = async() => {
            try{
                let queryResult = await this.Dynamodb.query(params).promise()
                if(queryResult.Items.length == 0){
                    success.data = '중복되었어요'
                    this.res.status(200).send(success)
                    return;
                }
                else{
                    success.data = '가능해요'
                    this.res.status(200).send(success)
                    return;
                }
            }
            catch(err){
                fail.error = error.dbError
                fail.errdesc = err
                this.res.status(521).send(fail)
            }
        }
        run()
    }
    
    public readPlaying(params: any): void{
        let id = params.id
        if(id != this.req.session.passport.user.id){
            fail.error = error.invalAcc
            fail.errdesc = "잘못된 접근입니다."
            this.res.status(400).send(fail)
            return;
        }
        let queryParams = {
            TableName: 'Member',
            KeyConditionExpression: 'id = :id',
            ExpressionAttributeValues: {':id': id},
            ProjectionExpression: 'playingCampaigns'
        }
        let campaignParams = {
            RequestItems:{
                'Campaign':{
                    Keys: null,
                    ProjectionExpression: 'id, #name, imgs, description',
                    ExpressionAttributeNames: {'#name': 'name'}
                }
            }
        }
        const run = async() => {
            try{
                let uid = this.req.session.passport.user.id
                if(uid != params.id){
                    fail.error = error.invalAcc
                    fail.errdesc = "잘못된 접근입니다."
                    this.res.status(400).send(fail)
                    return;
                }
                console.log(`DB 읽어오는중...`)
                let result = await this.Dynamodb.query(queryParams).promise()
                if(result.Items[0].playingCampaigns.length == 0){
                    success.data = []
                    this.res.status(200).send(success)
                    return;
                }
                console.log(`읽기 성공! 결과 JSON\n${JSON.stringify(result.Items[0].playingCampaigns)}`)
                let keys = []
                for(const campaign of result.Items[0].playingCampaigns){
                    let obj = {
                        'id': campaign.id
                    }
                    keys.push(obj)
                }
                campaignParams.RequestItems.Campaign.Keys = keys
                let data = result.Items[0].playingCampaigns
                let camp = await this.Dynamodb.batchGet(campaignParams).promise()
                let campaigns = camp.Responses.Campaign
                for(const campaign of campaigns){
                    for(let i =0; i < data.length; i++){
                        if(data[i].id == campaign.id){
                            data[i].name = campaign.name
                            data[i].imgs = campaign.imgs
                            data[i].description = campaign.description
                        }
                    }
                }
                success.data = data
                this.res.status(200).send(success)
            }
            catch(err){
                fail.error = error.dbError
                fail.errdesc = err
                this.res.status(521).send(err)
            }
        }
        run();
    }

    public readMyCamp(params: any): void{
        let id = params.id
        if(id != this.req.session.passport.user.id){
            fail.error = error.invalAcc
            fail.errdesc = "잘못된 접근입니다."
            this.res.status(400).send(fail)
            return;
        }
        let queryParams = {
            TableName: 'Member',
            KeyConditionExpression: 'id = :id',
            ExpressionAttributeValues: {':id': id},
            ProjectionExpression: 'myCampaigns'
        }
        let campaignParams = {
            RequestItems:{
                'Campaign':{
                    Keys: null,
                    ProjectionExpression: 'id, #name, imgs, description',
                    ExpressionAttributeNames: {'#name': 'name'}
                }
            }
        }
        const run = async() => {
            try{
                let uid = this.req.session.passport.user.id
                if(uid != params.id){
                    fail.error = error.invalAcc
                    fail.errdesc = "잘못된 접근입니다."
                    this.res.status(400).send(fail)
                    return;
                }
                console.log(`DB 읽어오는중...`)
                let result = await this.Dynamodb.query(queryParams).promise()
                if(result.Items[0].myCampaigns.length == 0){
                    success.data = []
                    this.res.status(200).send(success)
                    return;
                }
                console.log(`읽기 성공! 결과 JSON\n${JSON.stringify(result.Items[0].myCampaigns)}`)
                let keys = []
                for(const id of result.Items[0].myCampaigns){
                    let obj = {
                        'id': id
                    }
                    keys.push(obj)
                }
                campaignParams.RequestItems.Campaign.Keys = keys
                let data = keys
                let camp = await this.Dynamodb.batchGet(campaignParams).promise()
                let campaigns = camp.Responses.Campaign
                for(const campaign of campaigns){
                    for(let i =0; i < data.length; i++){
                        if(data[i].id == campaign.id){
                            data[i].name = campaign.name
                            data[i].imgs = campaign.imgs
                            data[i].description = campaign.description
                        }
                    }
                }
                success.data = data
                this.res.status(200).send(success)
            }
            catch(err){
                fail.error = error.dbError
                fail.errdesc = err
                this.res.status(521).send(err)
            }
        }
        run();
    }

    public checkPlaying(params: any): void{
        params.uid = nbsp2plus(params.uid)
        params.caid = nbsp2plus(params.caid)
        let queryParams = {
            TableName: 'Member',
            KeyConditionExpression: 'id = :id',
            ProjectionExpression: 'playingCampaigns',
            ExpressionAttributeValues: {':id': params.uid}
        }
        const run = async() =>{
            try{
                let result = await this.Dynamodb.query(queryParams).promise()
                let playing = result.Items[0].playingCampaigns
                console.log(playing)
                for(const camp of playing){
                    if(camp.id == params.caid){
                        success.data = '이미 참여중인 캠페인 입니다.'
                        this.res.status(200).send(success)
                        return;
                    }
                }
                success.data = '참여 가능한 캠페인 입니다.'
                this.res.status(200).send(success)
            }
            catch(err){
                fail.error = error.dbError
                fail.errdesc = err
                this.res.status(521).send(fail)
            }
        }
        run()
    }

    public deletePlaying(params: any): void{
        let uid = params.uid
        let caid = params.caid
        if(uid != this.req.session.passport.user.id){
            fail.error = error.invalAcc
            fail.errdesc = '세션 정보와 id가 일치하지않습니다.'
            this.res.status(400).send(fail)
            return;
        }
        let queryParams = {
            TableName: 'Member',
            KeyConditionExpression: 'id = :id',
            ProjectionExpression: 'playingCampaigns',
            ExpressionAttributeValues: {':id': uid}
        }
        let updateParams = {
            TableName: 'Member',
            Key: {id: uid},
            UpdateExpression: null,
            ExpressionAttributeValues: null,
            RetrunValues: 'ALL_NEW',
            ConditionExpression: 'attribute_exists(id)'
        }
        const run = async() => {
            try{
                console.log('참여중 캠페인 검색중')
                let campResult = await this.Dynamodb.query(queryParams).promise()
                console.log(`참여중 캠페인\n${JSON.stringify(campResult.Items[0].playingCampaigns, null, 2)}`)
                let playingCamps = campResult.Items[0].playingCampaigns
                for(let i = 0; i < playingCamps.length; i++){
                    if(playingCamps[i].id == caid){
                        playingCamps.splice(i, 1)
                        break;
                    }
                    if(i == playingCamps.length -1){
                        fail.error = error.invalKey
                        fail.errdesc = '캠페인을 찾을 수 없습니다.'
                        this.res.status(400).send(fail)
                        return;
                    }
                }
                updateParams.UpdateExpression = 'SET playingCampaigns = :playingCamp'
                updateParams.ExpressionAttributeValues = {':playingCamp': playingCamps}
                console.log('참여중 캠페인 삭제중')
                await this.Dynamodb.update(updateParams).promise()
                success.data = '삭제 성공'
                this.res.status(200).send(success)
            }
            catch(err){
                fail.error = error.dbError
                fail.errdesc = err
                this.res.status(521).send(fail)
            }
        }
        run()
    }
}