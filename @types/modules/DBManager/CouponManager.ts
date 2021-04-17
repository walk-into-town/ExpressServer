import { FeatureManager} from "./FeatureManager";
import * as CryptoJS from 'crypto-js'

export default class CouponManager extends FeatureManager{
    /**
     * 쿠폰 등록 로직
     * 1. 상품의 수와 발급 제한 개수가 동일한지 확인
     * 2. 현재 시각을 이용해 id 생성
     * 3. DB에 추가
     * 4. 쿼리 결과에 따라 사용자에게 응답
     */
    public insert(params: any): void {
        if(params.goods.length != params.limit.length){
            let result = {
                result: 'failed',
                error: 'amounts of goods and limit are different'
            }
            this.res.status(200).send(result)
            return;
        }
        let hash = CryptoJS.SHA256(Date().toString() + params.title)
        let id = hash.toString(CryptoJS.enc.Base64)
        var queryParams = {
            TableName: 'Coupon',
            Item: {
                id: id,
                title: params.title,
                description: params.description,
                goods: params.goods,
                endDate: params.endDate,
                issued: 0,
                limit: params.limit,
                img: params.img
            },
            ConditionExpression: "attribute_not_exists(id)"      //항목 추가하기 전에 이미 존재하는 항목이 있을 경우 pk가 있을 때 조건 실패. pk는 반드시 있어야 하므로 replace를 방지
        }
        const run = async() => {
            await this.Dynamodb.put(queryParams).promise()
            let result = {
                result: 'success',
                message: {
                    'id': id
                }
            }
            this.res.status(201).send(result)
        }
        try{
            run();
        }
        catch(err){                 //DB에러 발생
            let result = {
                result: 'failed',
                error: err
            }
            this.res.status(400).send(result)
        }
        
    }
    public read(params: any): void {
        let type = params.type
        let queryParams = {
            TableName: 'None',
            KeyConditionExpression: '#id = :id',
            ExpressionAttributeNames: {'#id': 'id'},
            ExpressionAttributeValues: {':id': params.id,},
            ProjectionExpression: ''
        }
        switch(type){
            case "coupon":
                queryParams.TableName = 'Coupon'
                delete(queryParams.ProjectionExpression)
                break;
            case "campaign":
                queryParams.TableName = 'Campaign'
                queryParams.ProjectionExpression = 'pinpoint'
                break;
            default:
                let result = {
                    result: 'failed',
                    error:  'Type Mismatch. Select Type between coupon and campaign'
                }
                this.res.status(400).send(result)
                return;
        }
        const run = async() => {
            let queryResult = await this.Dynamodb.query(queryParams).promise()
            let result = {
                result: 'success',
                message: queryResult.Items
            }
            this.res.status(200).send(result)
        }
        try{
            run();
        }
        catch(err){
            let result = {
                result: 'failed',
                error: 'DB Error. Please Contect Manager'
            }
            this.res.status(400).send(result)
        }
    }
    public update(params: any): void {
        throw new Error("Method not implemented.");
    }
    public delete(params: any): void {
        throw new Error("Method not implemented.");
    }
    
}