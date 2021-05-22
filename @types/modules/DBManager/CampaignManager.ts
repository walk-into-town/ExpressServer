import { FeatureManager, toRead } from "./FeatureManager"
import * as CryptoJS from 'crypto-js'
import { error, fail, success } from "../../static/result"
import {nbsp2plus} from '../Logics/nbsp'


export default class CampaignManager extends FeatureManager{
    /**
     * 캠페인 생성 로직
     * 1. 제작자 + 이름 + 지역으로 id생성
     * 2. 사용자 id와 핀포인트 id, 쿠폰 id의 유효성 검사
     * 3. 유효하다면 isValid = true
     * 4. 유효할 때 캠페인 생성 아닐경우 error
     */
    public insert(params: any): void {
        let date = new Date()
        console.log(date.toString())
        let hash = CryptoJS.SHA256(params.ownner + params.name + params.region + date.toString())
        let id = hash.toString(CryptoJS.enc.Base64)
        this.res.locals.id = id
        const run = async () => {
            try{
                let isIdValid: boolean            //입력받은 사용자 id, 핀포인트 id가 존재하는지 검증
                let isPinpointValid: boolean
                let isCouponValid: boolean
                
                if(params.coupon != undefined){
                    if(params.coupon != undefined){
                        let checkCouponParams = {
                            TableName: 'Coupon',
                            KeyConditionExpression: 'id = :id',
                            ExpressionAttributeValues: {
                                ':id' : params.coupon
                            }
                        }
                        console.log(`쿠폰 체크\nDB 요청 params\n${JSON.stringify(checkCouponParams, null, 2)}`)
                        await this.Dynamodb.query(checkCouponParams, onCheckCoupon.bind(this)).promise()
                    }
                    
                    function onCheckCoupon(err: object, data: any){
                        if(isCouponValid == false){
                            return;
                        }
                        if(err){
                            isCouponValid = false
                            fail.error = error.dbError
                            fail.errdesc = err
                            console.log('쿠폰 체크 DB 에러 발생')
                        }
                        else{
                            if(data.Items[0] == undefined){     //data.Item == undefined -> 해당하는 ID가 없음
                                isCouponValid = false
                                fail.error = error.dataNotFound
                                fail.errdesc = '일치하는 쿠폰 없음'
                                console.log('일치하는 쿠폰 없음')
                                return;
                            }
                            isCouponValid = true
                        }
                    }
                    
                }
                let checkIdParams = {
                    TableName: 'Member',
                    KeyConditionExpression: 'id = :id',
                    ExpressionAttributeValues: {
                        ':id' : params.ownner
                    }
                }
                function onCheckId(err: object, data: any){     //사용자 ID를 확인할 떄 호출되는 함수
                    if(isIdValid == false){
                        return;
                    }
                    if(err){                        //DB오류
                        isIdValid = false
                        fail.error = error.dbError
                        fail.errdesc = err
                        console.log('ID 체크 DB 에러 발생')
                        return;
                    }
                    else{
                        if(data.Items == undefined){     //data.Item == undefined -> 해당하는 ID가 없음
                            isIdValid = false
                            fail.error = error.dataNotFound
                            fail.errdesc = '일치하는 사용자 없음'
                            console.log('일치하는 사용자 없음')
                            return;
                        }
                        isIdValid = true
                    }
                }

                console.log(`사용자 체크\nDB 요청 params\n${JSON.stringify(checkIdParams, null, 2)}`)
                await this.Dynamodb.query(checkIdParams, onCheckId.bind(this)).promise()  //id를 가져온 후 확인
                
                let pinpoints = []
                params.pinpoints.forEach(pinpoint => {      //batchget에 맞추기 위해서 {"id": "pinpointid"}로 변환
                    pinpoints.push({'id': pinpoint})
                })

                let checkPinpointParams = {
                    RequestItems:{
                        'Pinpoint':{
                            Keys: pinpoints
                        }
                    }
                }

                function onCheckPinoint(err: object, data: any){    //핀포인트 ID를 확인할 때 호출되는 함수
                    data = data.Responses.Pinpoint
                    if(isPinpointValid == false){
                        return;
                    }
                    if(err){                            //DB에러
                        isPinpointValid = false
                        fail.error = error.dbError
                        fail.errdesc = err
                        console.log('핀포인트 체크 DB 에러 발생')
                    }
                    else{
                        if(data == undefined){        //일치하는 핀포인트 ID가 하나도 없을 때
                            isPinpointValid = false
                            fail.error = error.dataNotFound
                            fail.errdesc = '일치하는 핀포인트 없음'
                            console.log('일치하는 핀포인트 없음')
                            return;
                        }
                        if(data.length != pinpoints.length){  //DB가 준 핀포인트 수와 사용자 입력 핀포인트 수가 다름 = 잘못된 핀포인트 존재
                            isPinpointValid = false
                            fail.error = error.dataNotFound
                            fail.errdesc = '핀포인트 일치하지 않음'
                            console.log('일부 핀포인트가 일치하지 않음')
                            return;
                        }
                        isPinpointValid = true
                        data.forEach(pinpoint => {
                            if(pinpoint.coupon != undefined){
                                params.pcoupons.push(pinpoint.coupon)
                            }
                        })
                    }
                }
                console.log(`핀포인트 체크\nDB 요청 params\n${JSON.stringify(checkPinpointParams, null, 2)}`)
                await this.Dynamodb.batchGet(checkPinpointParams, onCheckPinoint.bind(this)).promise()
                
                if(isIdValid == false || isPinpointValid == false || isCouponValid == false){  //사용자 ID와 핀포인트 ID를 체크해서 1개라도 틀린경우 
                    this.res.status(400).send(fail)                //에러 메시지 전달
                    console.log(`응답 jSON\n${JSON.stringify(fail, null, 2)}`)
                    return;
                }
                let date = new Date()
                params.updateTime = date.toISOString()

                var queryParams = {
                    TableName: 'Campaign',
                    Item: {
                        id: id,
                        ownner: params.ownner,
                        imgs: params.imgs,
                        name: params.name,
                        description: params.description,
                        updateTime: params.updateTime,
                        region: params.region,
                        pinpoints: params.pinpoints,
                        coupons: [params.coupons],
                        pcoupons: params.pcoupons,
                        comments: []
                    },
                    ConditionExpression: "attribute_not_exists(id)"      //항목 추가하기 전에 이미 존재하는 항목이 있을 경우 pk가 있을 때 조건 실패. pk는 반드시 있어야 하므로 replace를 방지
                }
                console.log(`캠페인 등록 DB 요청 params\n${JSON.stringify(queryParams, null, 2)}`)
                this.res.locals.campid = id
                await this.Dynamodb.put(queryParams).promise()
                let MemberParams = {
                    TableName: 'Member',
                    Key: {id: params.ownner},
                    UpdateExpression: 'set myCampaigns = list_append(if_not_exists(myCampaigns, :emptylist), :newCampaign)',
                    ExpressionAttributeValues: {':newCampaign': [id], ':emptylist': []},
                    ReturnValues: 'UPDATED_NEW',
                    ConditionExpression: "attribute_exists(id)"
                }
                console.log('제작 캠페인 업데이트중...')
                await this.Dynamodb.update(MemberParams).promise()
                success.data = id
                console.log('제작 캠페인 업데이트 완료')
                console.log(`응답 JSON\n${JSON.stringify(success, null, 2)}`)
                this.res.status(201).send(success)
            }
            catch(err){
                for (const id of this.res.locals.cids) {
                    let deleteParams = {
                        TableName: 'Coupon',
                        Key:{
                            'id': id
                        }
                    }
                    await this.Dynamodb.delete(deleteParams).promise()
                }
                for (const id of this.res.locals.pids) {
                    let deleteParams = {
                        TableName: 'Pinpoint',
                        Key:{
                            'id': id
                        }
                    }
                    await this.Dynamodb.delete(deleteParams).promise()
                }
                let campParam = {
                    TableName: 'Campaign',
                    Key: {
                        'id': this.res.locals.campid
                    }
                }
                await this.Dynamodb.delete(campParam).promise()
                fail.error = error.invalReq
                fail.errdesc = err
                this.res.status(521).send(fail)
            }
        }
        run()
    }

    // private onInsert(err: object, data: any){
    //     if(err){                                    //에러 발생
    //         fail.error = error.dbError
    //         fail.errdesc = err
    //         this.res.status(400).send(fail)
    //         console.log(`DB에러\n응답 JSON\n${JSON.stringify(fail, null, 2)}`)
    //     }
    //     else{                                      //정상 처리
    //         success.data = this.res.locals.id
    //         this.res.status(201).send(success)
    //         console.log(`캠페인 등록 성공\n응답 JSON\n${JSON.stringify(success, null, 2)}`)
    //     }
    // }

    /**
     * 캠페인 조회 로직
     * 1. readType에 따라 사용할 GSI를 선택한다.
     * 2. 선택한 GSI를 이용해 쿼리를 전달한다.
     * 3. 사용자에게 결과를 전달한다.
     */
    public read(params: any, readType: toRead): void {
        let index = null
        let expAttrVals: any
        switch (readType) {                 //Index를 선택하는 부분. 백틱을 사용할 수 없기 때문에
            case toRead.name:               //다음과 expAttrVals를 만듦
                index = 'nameIndex'
                expAttrVals = {
                   '#name' : readType
                }
                break;
            case toRead.id:
                params = nbsp2plus(params)
                expAttrVals = {
                   '#id' : readType
                }
                break;
            case toRead.ownner:
                index = 'ownnerIndex'
                expAttrVals = {
                   '#ownner' : readType
                }
                break;
            case toRead.region:
                index = 'regionIndex'
                expAttrVals = {
                   '#region' : readType
                }
                break;
        }
        params = {
            TableName: 'Campaign',
            IndexName: index,
            KeyConditionExpression: `#${readType} = :value`,
            ExpressionAttributeNames : expAttrVals,
            ExpressionAttributeValues: {':value': params},
        }
        console.log(`DB 요청 params\n${JSON.stringify(params, null, 2)}`)
        this.Dynamodb.query(params, this.onRead.bind(this))
    }

    public readPart(params: any, readType: toRead): void{
        let criterion = readType
        let value = params
        const quickSort = require('../Logics/Sorter')
        const run = async(criterion, value) => {
            try{
                console.log('DB 요청 params 설정중')
                let FilterExp: string; let ExpAttrNames: any
                switch (criterion) {
                case 'name':
                    FilterExp = `contains(#${criterion}, :value)`
                    ExpAttrNames = {'#name': 'name'}
                    break;
                case 'ownner':
                    FilterExp = `contains(#${criterion}, :value)`
                    ExpAttrNames = {'#ownner': 'ownner'}
                    break;
                case 'region':
                    FilterExp = `contains(#${criterion}, :value)`
                    ExpAttrNames = {'#region': 'region'}
                    break; 
                default:
                    break;
                }
                let queryParams = {
                TableName: 'Campaign',
                FilterExpression: FilterExp,
                ExpressionAttributeNames: ExpAttrNames,
                ExpressionAttributeValues: {':value': value}
                }
                console.log(`DB 요청 params 설정 완료. 설정 JSON${JSON.stringify(queryParams, null, 2)}`)
                console.log('캠페인 스캔중')
                let result = await this.Dynamodb.scan(queryParams).promise()
                console.log(`캠페인 스캔 완료. 결과 JSON${JSON.stringify(result, null, 2)}`)
                if(result.Items.length == 1){
                    success.data = result.Items
                    console.log(`응답 JSON\n${JSON.stringify(success, null, 2)}`)
                    this.res.status(200).send(success)
                    return;
                }
                if(result.Items.length == 0){
                    success.data = []
                    console.log(`응답 JSON\n${JSON.stringify(success, null, 2)}`)
                    this.res.status(200).send(success)
                    return;
                }
                let toSort = []
                let primearr = []
                for (const object of result.Items) {
                    if(object.name.startsWith(value)){
                        primearr.push(object)
                    }
                    else{
                        toSort.push(object)
                    }
                }
                console.log('정렬 시작')
                toSort = await quickSort(toSort)
                primearr = await quickSort(primearr)
                primearr.push(...toSort)
                console.log(`정렬 완료. 정렬된 배열\n${JSON.stringify(primearr, null, 2)}`)
                success.data = primearr
                console.log(`응답 JSON\n${JSON.stringify(success, null, 2)}`)
                this.res.status(200).send(success)
            }
            catch(err){
                fail.error = error.dbError
                fail.errdesc = err
                this.res.status(521).send(fail)
            }
        }
        run(criterion, value)
    }

    public scan(){
        let queryParams = {
            TableName: 'Campaign'
        }
        const run = async() => {
            console.log('캠페인 전체 조회 시작')
            try{
                let queryResult = await this.Dynamodb.scan(queryParams).promise()
                success.data = queryResult.Items
                console.log(`조회 성공. 응답 JSON\n${JSON.stringify(success, null, 2)}`)
                this.res.status(200).send(success)
            }
            catch(err){
                fail.error = error.dbError
                fail.errdesc = err
                console.log(`조회 실패. 응답 JSON\n${JSON.stringify(fail, null, 2)}`)
                this.res.status(521).send(fail)
            }
        }
        run()
    }

    private onRead(err: object, data: any){
        if(err){                                    //에러 발생
            fail.error = error.dbError
            fail.errdesc = err
            console.log(`조회 실패. 응답 JSON\n${JSON.stringify(fail, null, 2)}`)
            this.res.status(521).send(fail)
        }
        else{
            if(data.Items[0] == undefined){
                success.data = []
            }
            else{
                success.data = data.Items
            }
            console.log(`조회 성공. 응답 JSON\n${JSON.stringify(success, null, 2)}`)
            this.res.status(200).send(success)
        }
    }

    /**
     * 캠페인 수정 로직
     * 1. 사용자가 입력한 id를 이용해 캠페인 검색
     * 2. 송신 데이터 중 입력된 값만 변경
     * 3. 결과 전달
     */
    public update(params: any): void {
        let queryParams = {
            TableName: 'Campaign',
            KeyConditionExpression: 'id = :id',
            ExpressionAttributeValues: {':id': params.cid}
        }
        const run = async() => {
            try{
                const result = await this.Dynamodb.query(queryParams).promise()
                let originCampaign = result.Items[0]
                if(originCampaign == undefined){        //일치하는 id 없음
                    fail.error = error.dataNotFound
                    fail.errdesc = '일치하는 캠페인 id 없음'
                    this.res.status(400).send(fail)
                    return;
                }
                let pinpoints = []; let coupons = []
                params.pinpoints.forEach(pinpoint => {
                    pinpoints.push({"id": pinpoint})
                })
                params.coupons.forEach(coupon => {
                    coupons.push({"id": coupon})
                })
                let checkParams = {
                    RequestItems:{
                        'Pinpoint':{
                            Keys: pinpoints
                        },
                        'Coupon':{
                            Keys: coupons
                        }
                    }
                }
                const check = await this.Dynamodb.batchGet(checkParams).promise()
                let pinpointCheck = check.Responses.Pinpoint.length           
                let couponCheck = check.Responses.Coupon.length
                if(pinpointCheck != pinpoints.length || couponCheck != coupons.length){
                    fail.error = error.dataNotFound
                    fail.errdesc = '일치하는 핀포인트 또는 쿠폰 id 없음'
                    this.res.status(400).send(fail)
                    return;
                }
            }
            catch (err) {                             //DB 에러 발생
                fail.error = error.dbError
                fail.errdesc = err
                this.res.status(521).send(fail)
            }
        }
        run()
    }
    public delete(params: any): void {
        
    }

    public participate(params: any): void{
        if(this.req.session.passport.user.id != params.uid){   //세션 탈취 방지
            fail.error = error.invalAcc
            fail.errdesc = '잘못된 사용자 iD'
            this.res.status(400).send(fail)
            return;
        }
        let userId = params.uid
        let cId = params.caid
        let campaigncheck = {
            TableName: 'Campaign',
            KeyConditionExpression: 'id = :id',
            ExpressionAttributeValues: {':id' : cId}
        }
        let myCampCheck = {
            TableName: 'Member',
            KeyConditionExpression: 'id = :id',
            ProjectionExpression: 'myCampaigns, playingCampaigns',
            ExpressionAttributeValues: {':id': userId}
        }
        let playingCamp = []
        let updateParams = {
            TableName: 'Member',
            Key: {id: userId},
            UpdateExpression: 'set playingCampaigns = list_append(if_not_exists(myCampaigns, :emptylist), :newCampaign)',
            ExpressionAttributeValues: {':newCampaign': null, ':emptylist': []},
            ReturnValues: 'UPDATED_NEW',
            ConditionExpression: "attribute_exists(id)"
        }
        const run = async () => {
            try{
                console.log('캠페인 존재 여부 확인중...')
                let campCheckResult = await this.Dynamodb.query(campaigncheck).promise()
                if(campCheckResult.Items[0] == undefined){
                    fail.error = error.invalKey
                    fail.errdesc = '잘못된 캠페인 id'
                    this.res.status(400).send(fail)
                    return;
                }
                console.log('캠페인 존재 여부 통과')
                let MycheckResult = await this.Dynamodb.query(myCampCheck).promise()
                let myCampaigns:Array<string> = MycheckResult.Items[0].myCampaigns
                let playingCampaigns: Array<any> = MycheckResult.Items[0].playingCampaigns
                console.log('캠페인 검사 시작')
                console.log('본인 제작 여부 확인중...')
                for(let i =0; i < myCampaigns.length; i++){
                    if(myCampaigns[i] == cId){
                        fail.error = error.invalReq
                        fail.errdesc = '본인이 제작한 캠페인은 참여하실 수 없습니다.'
                        this.res.status(400).send(fail)
                        return;
                    }
                }
                console.log('본인 제작 여부 통과')
                console.log('참여중 여부 확인중...')
                for(let i =0; i < playingCampaigns.length; i++){
                    if(playingCampaigns[i].id == cId){
                        fail.error = error.invalReq
                        fail.errdesc = '참여 중이거나 이미 참여한 캠페인입니다.'
                        this.res.status(400).send(fail)
                        return;
                    }
                }
                console.log('참여중 여부 통과')
                console.log('캠페인 검사 통과')
                console.log('DB 반영 시작')
                let pinpoint2add = []
                for(const id of campCheckResult.Items[0].pinpoints){
                    let obj = {
                        'id': id,
                        cleared: false
                    }
                }
                let camp2add = {
                    id: cId,
                    cleared: false,
                    pinpoints: pinpoint2add
                }
                playingCamp.push(camp2add)
                updateParams.ExpressionAttributeValues[":newCampaign"] = playingCamp
                console.log(updateParams)
                let partiResult = await this.Dynamodb.update(updateParams).promise()
                success.data = partiResult.Attributes
                console.log(`DB 반영 완료.\n응답 JSOn\n${JSON.stringify(success.data, null, 2)}`)
                this.res.status(201).send(success)
            }
            catch(err){
                fail.error = error.dbError
                fail.errdesc = err
                this.res.status(521).send(fail)
            }
        }
        run()
    }

    public insertComment(params: any){
        let userid = this.req.session.passport.user.id
        let date = new Date()
        let hash = CryptoJS.SHA256(params.caid + date.toString())  //id 생성
        params.coid = hash.toString(CryptoJS.enc.Base64)
        if(userid != params.comments.userId){   //세션의 id와 전송한 id가 다른 경우
            fail.error = error.invalKey
            fail.errdesc = '세션 정보와 id가 일치하지 않습니다.'
            this.res.status(400).send(fail)
            return;
        }
        if(params.rate > 5 || params.rate < 0){
            fail.error = error.invalReq
            fail.errdesc = '평점은 5점 이하, 0점 이상이어야 합니다.'
            this.res.status(400).send(fail)
            return;
        }
        let memberParams = {
            TableName: 'Member',
            KeyConditionExpression: 'id = :id',
            ExpressionAttributeValues: {':id': userid},
            ProjectionExpression: 'profileImg, nickname'
        }
        let campaignParams = {
            TableName: 'Campaign',
            KeyConditionExpression: 'id = :id',
            ExpressionAttributeValues: {':id': params.caid},
            ProjectionExpression: 'comments'
        }
        let comment = [{
            id: params.coid,
            userId: userid,
            text: params.comments.text,
            rated: Number(params.rate),
            imgs: params.imgs,
            nickname: null,
            profileImg: null,
            updateTime: date.toISOString()
        }]
        let queryParams = {
            TableName: 'Campaign',
            Key: {id: params.caid},
            UpdateExpression: 'set comments = list_append(if_not_exists(comments, :emptylist), :newcomment)',
            ExpressionAttributeValues: {':newcomment': comment, ':emptylist': []},
            ReturnValues: 'UPDATED_NEW',
            ConditionExpression: "attribute_exists(id)"
        }
        const run = async() => {
            try{
                let campaignResult = await this.Dynamodb.query(campaignParams).promise()
                let comments = campaignResult.Items[0].comments
                for(const comm of comments){
                    if(comm.userId == userid){
                        fail.error = error.invalReq
                        fail.errdesc = '이미 리뷰를 등록한 캠페인 입니다.'
                        this.res.status(400).send(fail)
                        return;
                    }
                }
                let userResult = await this.Dynamodb.query(memberParams).promise()
                let user = userResult.Items[0]
                comment[0].nickname = user.nickname
                comment[0].profileImg = user.profileImg
                console.log(comment[0])
                let queryResult = await this.Dynamodb.update(queryParams).promise()
                success.data = comment[0]
                this.res.status(201).send(success)
            }
            catch(err){
                fail.error = error.dbError
                fail.errdesc = err
                this.res.status(521).send(fail)
            }
        }
        run();
    }

    public readComment(params: any){
        if(params.caid == undefined){
            fail.error = error.invalReq
            fail.errdesc = '요청의 id값이 없습니다.'
            this.res.status(400).send(fail)
            return;
        }
        params.caid = nbsp2plus(params.caid)
        let queryParams = {
            TableName: 'Campaign',
            KeyConditionExpression: 'id = :id',
            ProjectionExpression: 'comments',
            ExpressionAttributeValues: {':id': params.caid}
        }
        const run = async () => {
            try{
                console.log('댓글 검색중')
                let result = await this.Dynamodb.query(queryParams).promise()
                console.log(`조회 결과\n${JSON.stringify(result.Items, null, 2)}`)
                success.data = result.Items[0].comments
                this.res.status(200).send(success)
            }
            catch(err){
                fail.error = error.dbError
                fail.errdesc = err
                this.res.status(521).send(fail)
                return;
            }
        }
        run();
    }

    public updateComment(params: any){
        let userid = this.req.session.passport.user.id
        if(params.text == undefined && params.rate == undefined){
            fail.error = error.invalReq
            fail.errdesc = '평점 또는 리뷰 내용을 보내주세요.'
            this.res.status(400).send(fail)
            return;
        }
        if(userid != params.uid){   //세션의 id와 전송한 id가 다른 경우
            fail.error = error.invalKey
            fail.errdesc = '세션 정보와 id가 일치하지 않습니다.'
            this.res.status(400).send(fail)
            return;
        }
        if(params.rate > 5 || params.rate < 0){
            fail.error = error.invalReq
            fail.errdesc = '평점은 5점 이하, 0점 이상이어야 합니다.'
            this.res.status(400).send(fail)
            return;
        }
        let id = params.caid
        let findParams = {
            TableName: 'Campaign',
            KeyConditionExpression: 'id = :id',
            ProjectionExpression: 'comments',
            ExpressionAttributeValues: { ':id' : id}
        }
        let updateParams = {
            TableName: 'Campaign',
            Key: {id: params.caid},
            UpdateExpression: 'set comments = :newcomment',
            ExpressionAttributeValues: {':newcomment': null},
            ReturnValues: 'UPDATED_NEW',
            ConditionExpression: "attribute_exists(id)"
        }
        const run = async () => {
            try{
                let id = this.req.session.passport.user.id
                if(params.uid != id){
                    fail.error = error.invalAcc
                    fail.errdesc = "세션 정보와 id가 일치하지 않습니다."
                    this.res.status(400).send(fail)
                    return;
                }
                let comments = await this.Dynamodb.query(findParams).promise()
                if(comments.Items[0] == undefined){
                    fail.error = error.dataNotFound
                    fail.errdesc = "캠페인을 찾을 수 없습니다."
                    this.res.status(400).send(fail)
                    return;
                }
                console.log('댓글 찾는중...')
                for(let i =0; i < comments.Items[0].comments.length; i++){
                    let cid = comments.Items[0].comments[i].id
                    let uid = comments.Items[0].comments[i].userId
                    if(cid == params.coid && uid == params.uid){
                        console.log('조건 만족')
                        if(params.text == undefined){
                            comments.Items[0].comments[i].rated = params.rate
                            comments.Items[0].comments[i].time = new Date().toISOString()
                            success.data = comments.Items[0].comments[i]
                        }
                        else if(params.rate == undefined){
                            comments.Items[0].comments[i].text = params.text;
                            comments.Items[0].comments[i].time = new Date().toISOString()
                            success.data = comments.Items[0].comments[i]
                        }
                        else{
                            comments.Items[0].comments[i].rated = params.rate
                            comments.Items[0].comments[i].text = params.text;
                            comments.Items[0].comments[i].time = new Date().toISOString()
                            success.data = comments.Items[0].comments[i]
                        }

                        break;
                    }
                    if(i == comments.Items[0].comments.length -1){
                        fail.error = error.dataNotFound
                        fail.errdesc = "리뷰를 찾을 수 없습니다."
                        this.res.status(400).send(fail)
                        return;
                    }
                }
                console.log(comments.Items[0].comments)
                updateParams.ExpressionAttributeValues[":newcomment"] = comments.Items[0].comments
                console.log('댓글 수정중...')
                let updateResult = await this.Dynamodb.update(updateParams).promise()
                this.res.status(200).send(success)
            }
            catch(err){
                fail.error = error.dbError
                fail.errdesc = err
                this.res.status(521).send(fail)
            }
        }
        run();
    }

    public deleteComment(params: any){
        let uid = this.req.session.passport.user.id
        if(uid != params.uid){
            fail.error = error.invalAcc
            fail.errdesc = "세션정보와 id가 일치하지 않습니다."
            this.res.status(400).send(fail)
            return;
        }
        let id = params.caid
        let findParams = {
            TableName: 'Campaign',
            KeyConditionExpression: 'id = :id',
            ProjectionExpression: 'comments',
            ExpressionAttributeValues: { ':id' : id}
        }
        let updateParams = {
            TableName: 'Campaign',
            Key: {id: params.caid},
            UpdateExpression: 'set comments = :newcomment',
            ExpressionAttributeValues: {':newcomment': null},
            ReturnValues: 'UPDATED_NEW',
            ConditionExpression: "attribute_exists(id)"
        }
        const run = async () => {
            try{
                let comments = await this.Dynamodb.query(findParams).promise()
                if(comments.Items[0] == undefined){
                    fail.error = error.dataNotFound
                    fail.errdesc = "핀포인트를 찾을 수 없습니다."
                    this.res.status(400).send(fail)
                    return;
                }
                for(let i =0; i < comments.Items[0].comments.length; i++){
                    let cid = comments.Items[0].comments[i].id
                    let uid = comments.Items[0].comments[i].userId
                    if(cid == params.coid && uid == params.uid){
                        comments.Items[0].comments.splice(i,1);
                        break;
                    }
                    if(i == comments.Items[0].comments.length -1){
                        fail.error = error.invalKey
                        fail.errdesc = '리뷰를 찾을 수 없습니다.'
                        this.res.status(400).send(fail)
                        return;
                    }
                }
                console.log('댓글 찾는중...')
                console.log(comments.Items[0].comments)
                updateParams.ExpressionAttributeValues[":newcomment"] = comments.Items[0].comments
                let updateResult = await this.Dynamodb.update(updateParams).promise()
                success.data = updateResult.Attributes.comments
                this.res.status(200).send(success)
            }
            catch(err){
                fail.error = error.dbError
                fail.errdesc = err
                this.res.status(521).send(fail)
            }
        }
        run();
    }
}