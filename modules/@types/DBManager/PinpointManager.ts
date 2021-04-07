import { FeatureManager, ReadType } from "./FeatureManager";
import * as CryptoJS from 'crypto-js'


export class PinpointManager extends FeatureManager{

    /**
     * 핀포인트 API
     */
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
    
    private onInsert(err: object, data: any): void{
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

    public read(params: any, readType: ReadType): void {
        var queryParams = {
            RequestItems:{
                'Pinpoint':{
                    Keys: params
                }
            }
        }
        const run = async () => {              //batch 조회를 수행하기 때문에 비동기 함수를 사용
            await this.Dynamodb.batchGet(queryParams, this.onRead.bind(this)).promise()  // read를 수행할때 까지 대기
            if(this.res.locals.UnprocessedKeys != undefined){              //오류 발생 처리
                let result = {
                    "result": 'failed',
                    "error": "AWS Internal Server Error"
                }
                this.res.status(400).send(result)
            }
            let result = {
                'result': 'success',
                'message': this.res.locals.result.Pinpoint
            }
            this.res.status(201).send(this.res.locals.result.Responses.Pinpoint)
        }
        run()
     }
    
    private onRead(err: object, data: any): void{
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

    private onUpdate(err: object, data: any): void{
        if(err){
            let result = {
                result: 'failed',
                error: err
            }
            this.res.status(400).send(result)
        }
        else{
            let result = {
                'result': 'success',
                'message': data.Attributes
            }
            this.res.status(201).send(result)
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

    private onDelete(err: object, data: any): void{
        if(err){
            let result = {
                'result': 'failed',
                'error': err
            }
            this.res.status(401).send(result)
        }
        else{
            let result = {
                'result': 'success',
                'message': data.Attributes
            }
            this.res.status(200).send(result)
        }
    }


    /**
     * 핀포인트 상세 정보 API
     */
    
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
    
    private onReadDetail(err: object, data: any): void{
        console.log(data)
        if(data.Item == undefined){
            let result = {
                'result': 'failed',
                'error': 'Provided Key does not match'
            }
            this.res.status(400).send(result)
        }
        else{
            let result = {
                'result': 'success',
                'message': data.Item.result
            }
            this.res.status(201).send(result)
        }

    }

    public updateDetail(params: any): void{
        var queryParams = {
            TableName: 'Pinpoint',
            Key: {id: params.id},
            UpdateExpression: 'set description = :newdesc',
            ExpressionAttributeValues: {':newdesc': params.description},
            ReturnValues: 'UPDATED_NEW',
            ConditionExpression: "attribute_exists(id)"
        }
        this.Dynamodb.update(queryParams, this.onUpdateDetail.bind(this))
    }

    private onUpdateDetail(err: object, data: any): void{
        if(err){
            let result = {
                result: 'failed',
                error: err
            }
            this.res.status(400).send(result)
        }
        else{
            let result = {
                'result': 'success',
                'message': data.Attributes
            }
            this.res.status(201).send(result)
        }
    }


    /**
     * 핀포인트 퀴즈 API
     */
    public insertQuiz(params: any): void{
        var queryParams = {
            TableName: 'Pinpoint',
            Key: {id: params.id},
            UpdateExpression: 'set quiz = :quiz',
            ExpressionAttributeValues: {':quiz': params.quiz},
            ReturnValues: 'UPDATED_NEW',
            ConditionExpression: "attribute_exists(id)"
        }
        this.Dynamodb.update(queryParams, this.onInsertQuiz.bind(this))
    }

    private onInsertQuiz(err: object, data: any){
        if(err){
            let result = {
                'result': 'failed',
                'error': err
            }
            this.res.status(400).send(result)
        }
        else{
            let result = {
                'result': 'success',
                'message': data.Attributes
            }
            this.res.status(201).send(result)
        }
    }

    public readQuiz(params: any): void{
        var queryParams = {
            TableName: 'Pinpoint',
            Key: {
                'id': params.id
            },
            ProjectionExpression: 'quiz'
        }
        this.Dynamodb.get(queryParams, this.onReadQuiz.bind(this))
    }

    private onReadQuiz(err: object, data: any): void{
        if(err){
            let result = {
                'result': 'failed',
                'error': err
            }
            this.res.status(400).send(result)
        }
        else{
            let result = {
                'result': 'success',
                'message': data.Item
            }
            this.res.status(201).send(result)
        }
    }

    public updateQuiz(params: any): void{
        var queryParams = {
            TableName: 'Pinpoint',
            Key: {id: params.id},
            UpdateExpression: 'set quiz = :quiz',
            ExpressionAttributeValues: {':quiz': params.quiz},
            ReturnValues: 'UPDATED_NEW',
            ConditionExpression: "attribute_exists(id)"
        }
        this.Dynamodb.update(queryParams, this.onUpdateQuiz.bind(this))
    }

    private onUpdateQuiz(err: object, data: any){
        if(err){
            let result = {
                result: 'failed',
                error: err
            }
            this.res.status(400).send(result)
        }
        else{
            let result = {
                'result': 'success',
                'message': data.Attributes
            }
            this.res.status(201).send(result)
        }
    }
}