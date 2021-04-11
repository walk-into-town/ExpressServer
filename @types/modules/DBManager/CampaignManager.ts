import { FeatureManager, ReadType, toRead } from "./FeatureManager"
import * as CryptoJS from 'crypto-js'


export class CampaignManager extends FeatureManager{
    public insert(params: any): void {
        let hash = CryptoJS.SHA256(params.ownner + params.name + params.region)
        let id = hash.toString(CryptoJS.enc.Base64)
        this.res.locals.id = id
        const UniqueCheck = async () => {
            let pinpointId = []; let couponId = []
            params.pinpoints.forEach(pinpoint => {                  //dynamoDB 형식에 맞게 keyattribute: value 형식으로 변환
                let temp = {
                    'id': pinpoint
                }
                pinpointId.push(temp)
            })
            
            params.coupons.forEach(coupon => {
                let temp = {
                    'id': coupon
                }
                couponId.push(temp)
            })

            var checkParams = {                                     //batchget으로 일치하는 항목을 모두 가져옴
                RequestItems:{
                    'Pinpoint':{
                        Keys: pinpointId
                    },
                    'Coupon': {
                        Keys: couponId
                    },
                    'Member':{
                        Keys: [params.ownner]
                    }
                }
            }
            await this.Dynamodb.batchGet(checkParams, this.onUniqueCheck.bind(this)).promise()
            let checkresult = this.res.locals.result.Responses
            if((checkresult.Pinpoint.length != params.pinpoints.length) || 
                (checkresult.Coupon.length != params.coupons.length) || 
                (checkresult.member.length != 1)){   //셋중 하나라도 수가 안맞다 = 키가 없다.
                let result = {
                    'result': 'failed',
                    error: 'coupon, pinpoint or user does not exist'
                }
                this.res.status(400).send(result)
            }
            else{
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
        }
        UniqueCheck()
    }

    private onUniqueCheck(err: object, data: any){
        if(err){
            let result = {
                result: 'failed',
                error: err
            }
            this.res.status(400).send(result)
        }
        else{
            this.res.locals.result = data
        }
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
                "pinpointId": this.res.locals.id  // DynamoDB에서는 insert시 결과 X. 따라서 임의로 생성되는 id를 전달하기 위해 locals에 id 추가
            }
            this.res.status(201).send(result)
        }
    }

    public read(params: any, readType: toRead): void {
        let index = null
        let expAttrVals

        switch (readType) {
            case toRead.name:
                index = 'nameIndex'
                expAttrVals = {
                   '#name' : readType
                }
                break;
            case toRead.id:
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

    public update(params: any): void {
        
    }
    public delete(params: any): void {
       
    }
}