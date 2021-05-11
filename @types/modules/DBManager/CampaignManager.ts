import { FeatureManager, toRead } from "./FeatureManager"
import * as CryptoJS from 'crypto-js'
import { error, fail, success } from "../../static/result"


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
        let hash = CryptoJS.SHA256(params.ownner + params.name + params.region + date.toString())
        let id = hash.toString(CryptoJS.enc.Base64)
        this.res.locals.id = id
        
        params.pcoupons = []
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
                        coupons: params.coupons,
                        pcoupons: params.pcoupons,
                        comments: []
                    },
                    ConditionExpression: "attribute_not_exists(id)"      //항목 추가하기 전에 이미 존재하는 항목이 있을 경우 pk가 있을 때 조건 실패. pk는 반드시 있어야 하므로 replace를 방지
                    }
                    console.log(`캠페인 등록 DB 요청 params\n${JSON.stringify(queryParams, null, 2)}`)
                    await this.Dynamodb.put(queryParams).promise()

                    let MemberParams = {
                        TableName: 'Member',
                        Key: {id: params.ownner},
                        UpdateExpression: 'set myCampaigns = list_append(if_not_exists(myCampaigns, :emptylist), :newCampaign)',
                        ExpressionAttributeValues: {':newCampaign': [id], ':emptylist': []},
                        ReturnValues: 'UPDATED_NEW',
                        ConditionExpression: "attribute_exists(id)"
                    }
                    await this.Dynamodb.update(MemberParams).promise()
                    success.data = id
                }
                catch(err){
                    fail.error = error.dbError
                    fail.errdesc = err
                    this.res.status(400).send(fail);
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
                params = this.nbsp2plus(params)
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
        console.log(params)
        this.Dynamodb.query(params, this.onRead.bind(this))
    }

    private nbsp2plus = (query: string): string => {
        for(let i =0; i < query.length; i++){
            query = query.replace(' ', '+')
        }
        return query
    }

    public scan(){
        let queryParams = {
            TableName: 'Campaign'
        }
        const run = async() => {
            try{
                let queryResult = await this.Dynamodb.scan(queryParams).promise()
                success.data = queryResult.Items
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

    private onRead(err: object, data: any){
        if(err){                                    //에러 발생
            fail.error = error.dbError
            fail.errdesc = err
            this.res.status(400).send(fail)
        }
        else{
            if(data.Items[0] == undefined){
                success.data = []
            }
            else{
                success.data = data.Items
            }
            this.res.status(201).send(success)
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
            ExpressionAttributeValues: {':id': params.id}
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
                this.res.status(400).send(fail)
            }
        }
        run()
    }
    public delete(params: any): void {
        
    }
}