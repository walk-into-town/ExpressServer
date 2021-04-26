import { FeatureManager, toRead } from "./FeatureManager"
import * as CryptoJS from 'crypto-js'


export default class CampaignManager extends FeatureManager{
    /**
     * 캠페인 생성 로직
     * 1. 제작자 + 이름 + 지역으로 id생성
     * 2. 사용자 id와 핀포인트 id의 유효성 검사
     * 3. 유효하다면 isValid = true
     * 4. 유효할 때 캠페인 생성 아닐경우 error
     */
    public insert(params: any): void {
        let hash = CryptoJS.SHA256(params.ownner + params.name + params.region)
        let id = hash.toString(CryptoJS.enc.Base64)
        this.res.locals.id = id
        const run = async () => {
            let isIdValid: boolean            //입력받은 사용자 id, 핀포인트 id가 존재하는지 검증
            let isPinpointValid: boolean
            let result = {                    //사용자 id 검증 후 전달을 위한 id
                result: 'failed',
                error: []
            }                      
            let checkIdParams = {
                TableName: 'Member',
                KeyConditionExpression: 'id = :id',
                ExpressionAttributeValues: {
                    ':id' : params.ownner
                }
            }
            function onCheckId(err: object, data: any){     //사용자 ID를 확인할 떄 호출되는 함수
                if(err){                        //DB오류
                    isIdValid = false
                    result.error.push('DB Error. Please Contect Manager')
                    return;
                }
                else{
                    if(data.Items == undefined){     //data.Item == undefined -> 해당하는 ID가 없음
                        isIdValid = false
                        result.error.push('Invalid User')
                        return;
                    }
                    isIdValid = true
                }
            }
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
                if(err){                            //DB에러
                    isPinpointValid = false
                    result.error.push('DB Error. Please Contect Manager')
                }
                else{
                    if(data.Items == undefined){        //일치하는 핀포인트 ID가 하나도 없을 때
                        isPinpointValid = false
                        result.error.push('Invalid Pinpoint')
                        return;
                    }
                    if(data.Items.length != pinpoints.length){  //DB가 준 핀포인트 수와 사용자 입력 핀포인트 수가 다름 = 잘못된 핀포인트 존재
                        isPinpointValid = false
                        result.error.push('Invalid Pinpoint')
                        return;
                    }
                    isPinpointValid = true
                }
            }
            this.Dynamodb.batchGet(checkPinpointParams, onCheckPinoint.bind(this))

            if(isIdValid == false || isPinpointValid == false){  //사용자 ID와 핀포인트 ID를 체크해서 1개라도 틀린경우 
                this.res.status(400).send(result)                //에러 메시지 전달
                return;
            }

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
                    coupons: params.coupons
                },
                ConditionExpression: "attribute_not_exists(id)"      //항목 추가하기 전에 이미 존재하는 항목이 있을 경우 pk가 있을 때 조건 실패. pk는 반드시 있어야 하므로 replace를 방지
                }
                this.Dynamodb.put(queryParams, this.onInsert.bind(this))
        }
        run()
    }

    private onInsert(err: object, data: any){
        if(err){                                    //에러 발생
            let result = {
                result: 'failed',
                error: err
            }
            this.res.status(400).send(result)
        }
        else{                                      //정상 처리
            let result = {
                "result" : "success",
                "message": this.res.locals.id  // DynamoDB에서는 insert시 결과 X. 따라서 임의로 생성되는 id를 전달하기 위해 locals에 id 추가
            }
            this.res.status(201).send(result)
        }
    }

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
                expAttrVals = {
                   'id' : readType
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
        this.Dynamodb.query(params, this.onRead.bind(this))
    }

    private onRead(err: object, data: any){
        if(err){                                    //에러 발생
            let result = {
                result: 'failed',
                error: err
            }
            this.res.status(400).send(result)
        }
        else{
            let result = {
                result: 'success',
                message: data.Items
            }
            this.res.status(201).send(result)
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
            const result = await this.Dynamodb.query(queryParams).promise()
            let originCampaign = result.Items[0]
            if(originCampaign == undefined){        //일치하는 id 없음
                let result = {
                    result: 'failed',
                    error: 'Campaign id mismatch'
                }
                this.res.status(400).send(result)
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
                let result = {
                    result: 'failed',
                    error: 'One or more Pinpots or Coupons id are invalid'
                }
                this.res.status(400).send(result)
                return;
            }
        }
        try{
            run()
        } catch (error) {                             //DB 에러 발생
            let result = {
                result: 'failed',
                error: 'DB Error. Please Contect Manager',
                error2: error
            }
            this.res.status(400).send(result)
        }
    }
    public delete(params: any): void {
        
    }
}