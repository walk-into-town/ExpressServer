import { FeatureManager, ReadType, toRead } from "./FeatureManager"
import * as CryptoJS from 'crypto-js'


export class CampaignManager extends FeatureManager{
    public insert(params: any): void {
        let hash = CryptoJS.SHA256(params.ownner + params.name + params.region)
        let id = hash.toString(CryptoJS.enc.Base64)
        this.res.locals.id = id
        params.imgs.forEach(e => {
            console.log(e)
        })
        const run = async () => {
            let isValid: boolean            //입력받은 사용자 id, 핀포인트 id가 존재하는지 검증
            let result                      //사용자 id 검증 후 전달을 위한 id
            let checkIdParams = {
                TableName: 'Member',
                Key : {
                    'id' : params.ownner,
                },
            }
            function onCheckId(err: object, data: any){
                if(err){
                    isValid = false
                    result = {
                        result: 'error',
                        error: 'DB Error Please Contect Manager'
                    }
                }
                else{
                    if(data.Item == undefined){
                        isValid = false
                        result = {
                            result: 'failed',
                            error: 'Invalid User'
                        }
                        return;
                    }
                    isValid = true
                }
            }
            await this.Dynamodb.get(checkIdParams, onCheckId.bind(this)).promise()
            let pinpoints: any
            params.pinpoints.forEach(pinpoint => {
                pinpoints.push({'id': pinpoint})
            })
            let checkPinointParams = {
                RequestItems:{
                    'Pinpoint':{
                        Keys: pinpoints
                    }
                }
            }
            function onCheckPinoint(err: object, data: any){
                if(err){
                    isValid = false
                    result = {
                        result: 'error',
                        error: 'DB Error Please Contect Manager'
                    }
                }
                else{
                    console.log
                }
            }
            this.Dynamodb.batchGet(checkPinointParams)

            console.log(isValid)
            if(isValid == false){
                this.res.status(400).send(result)
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