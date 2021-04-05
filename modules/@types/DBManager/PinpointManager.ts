import { FeatureManager, ReadType } from "./FeatureManager";
import * as CryptoJS from 'crypto-js'


export class PinpointManager extends FeatureManager{
    public insert(params: any): void {
        let hash = CryptoJS.SHA256(params.name + params.latitude.toString() + params.longitude.toString())  //id 중복 방지 + 이름과 위치가 같은 핀포인트 중복 방지
        params.id = hash.toString(CryptoJS.enc.Base64)
        var queryParams = {
            TableName: 'Pinpoint',
            Item: {
                id: params.id,
                name: params.name,
                imgs: params.imgs,
                latitude: params.latitude,
                longitude: params.longitude,
                updateTime: params.updateTime,
                description: params.description,
                quiz: params.quiz
            },
            ConditionExpression: "attribute_not_exists(id)"      //항목 추가하기 전에 이미 존재하는 항목이 있을 경우 pk가 있을 때 조건 실패. pk는 반드시 있어야 하므로 replace를 방지
        }
        this.res.locals.id = params.id
        this.Dynamodb.put(queryParams, this.onInsert.bind(this))
    }
    
    private onInsert(err: object, data: any){
        if(err){
            let result = {
                result: 'failed',
                error: err
            }
            this.res.status(400).send(result)
        }
        else{
            let resultstr = {
                "result" : "success",
                "pinpointId": this.res.locals.id
            }
            this.res.status(201).send(resultstr)
        }
    }

    public read(params: any, readType: ReadType): void {
        var queryParams = {
            RequestItems:{
                'Pinpoint':{
                    Keys: params
                }
            }
        }
        const run = async () => {
            await this.Dynamodb.batchGet(queryParams, this.onRead.bind(this)).promise()
            if(this.res.locals.UnprocessedKeys != undefined){
                let fail = {
                    "result": 'failed',
                    "error": "AWS Internal Server Error"
                }
                this.res.status(400).send(fail)
            }
            this.res.status(201).send(this.res.locals.result.Responses.Pinpoint)
        }
        run()
     }
    
    private onRead(err: object, data: any){
        if(err){
            let result = {
                result: 'failed',
                error: err
            }
            this.res.status(400).send(result)
        }
        else{
            data.Responses.Pinpoint.result = "success"
            this.res.locals.result = data
        }
    }

    public update(params: any): void {
        var queryParams = {
            TableName: 'Pinpoint',
            Key: {id: params.id},
            UpdateExpression: 'set imgs = :newimgs',
            ExpressionAttributeValues: {':newimgs': params.imgs},
            ReturnValues: 'UPDATED_NEW',
            ConditionExpression: "attribute_exists(id)"
        }
        this.Dynamodb.update(queryParams, this.onUpdate.bind(this))
    }

    private onUpdate(err: object, data: any){
        if(err){
            let result = {
                result: 'failed',
                error: err
            }
            this.res.status(400).send(result)
        }
        else{
            data.Attributes.result = 'success'
            this.res.status(201).send(data.Attributes)
        }
    }

    public delete(params: any): void {
        var queryParams = {
            TableName: 'Pinpoint',
            Key: {
                'id': params.id
            },
            ReturnValues: 'ALL_OLD'
        }
        this.Dynamodb.delete(queryParams, this.onDelete.bind(this))
    }

    private onDelete(err: object, data: any){
        if(err){
            let result = {
                result: 'failed',
                error: err
            }
            this.res.status(401).send(result)
        }
        else{
            data.Attributes.result = 'success'
            this.res.status(200).send(data.Attributes)
        }
    }

    public readDetail(params: any): void{
        var queryParams = {
            TableName: 'Pinpoint',
            Key: {
                'id': params.id
            },
            ProjectionExpression: 'description'
        }
        this.Dynamodb.get(queryParams, this.onReadDetail.bind(this))
    }
    
    private onReadDetail(err: object, data: any){
        console.log(data)
        if(data.Item == undefined){
            let result = {
                'result': 'failed',
                'error': 'Provided Key does not match'
            }
            this.res.status(400).send(result)
        }
        else{
            data.Item.result = 'success'
            this.res.status(201).send(data.Item)
        }

    }

    public deleteDetail(params: any){
        var queryParams = {
            TableName: 'Pinpoint',
            Key: {id: params.id},
            UpdateExpression: 'set description = :newdesc',
            ExpressionAttributeValues: {':newdesc': ''},
            ReturnValues: 'UPDATED_NEW',
            ConditionExpression: "attribute_exists(id)"
        }
        this.Dynamodb.update(queryParams, this.onDeleteDetail.bind(this))
    }

    private onDeleteDetail(err: object, data: any){
        if(err){
            let result = {
                result: 'failed',
                error: err
            }
            this.res.status(400).send(result)
        }
        else{
            data.Attributes.result = 'success'
            this.res.status(201).send(data.Attributes)
        }
    }
}