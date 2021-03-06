import { FeatureManager, toRead } from "./FeatureManager";
import * as CryptoJS from 'crypto-js'
import { error, fail } from "../../static/result";


export default class PinpointManager extends FeatureManager{
    public read(params: any, ReadType?: toRead): void {
        throw new Error("Method not implemented.");
    }
    public update(params: any): void {
        throw new Error("Method not implemented.");
    }
    public delete(params: any): void {
        throw new Error("Method not implemented.");
    }
    /**
     * 핀포인트 등록 로직
     * 1. 핀포인트 이름, 위/경도로 hash id 생성
     * 2. 해당 id를 이용해 DB Insert
     * 3. ConditionExpression을 통해 id가 중복되면 실패
     */
    public insert(params: any) {
        let date = new Date(Date.now() + 9 * 60 * 60 * 1000)
        let hash = CryptoJS.SHA256(params.name + params.latitude.toString() + params.longitude.toString() + date.toString())  //id 생성
        params.id = hash.toString(CryptoJS.enc.Base64)
        let time = new Date(Date.now() + 9 * 60 * 60 * 1000)
        params.updateTime = time.toISOString()
        if(params.coupons == undefined){
            params.coupons = []
        }
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
                quiz: params.quiz,
                coupons: params.coupons,
                comments: []
            },
            ConditionExpression: "attribute_not_exists(id)"      // 항목 추가하기 전에 이미 존재하는 항목이 있을 경우 pk가 있을 때 조건 실패. pk는 반드시 있어야 하므로 replace를 방지
        }
        const run = async() => {
            try{
                console.log(`DB 요청 params\n${JSON.stringify(queryParams, null, 2)}`)
                this.res.locals.id = params.id
                this.res.locals.pids.push(params.id)
                let queryResult = await this.Dynamodb.put(queryParams).promise()
                this.res.locals.pinpoints.push(params.id)
                console.log(`등록 완료,\n 생성된 핀포인트 id : ${params.id}`)
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
                fail.error = error.invalReq
                fail.errdesc = err
                this.res.status(521).send(fail)
            }
        }
        return run;

    }
}