import { FeatureManager, toRead } from "./FeatureManager"
import * as CryptoJS from 'crypto-js'
import { error, fail } from "../../static/result"

export default class CouponManager extends FeatureManager{
    public read(params: any, ReadType?: toRead): void {
        throw new Error("Method not implemented.")
    }
    public update(params: any): void {
        throw new Error("Method not implemented.")
    }
    public delete(params: any): void {
        throw new Error("Method not implemented.")
    }
    /**
     * 쿠폰 등록 로직
     * 1. 상품의 수와 발급 제한 개수가 동일한지 확인
     * 2. 현재 시각을 이용해 id 생성
     * 3. DB에 추가
     * 4. 쿼리 결과에 따라 사용자에게 응답
     */
    public insert(params: any) {
        let hash = CryptoJS.SHA256(Date().toString() + params.name + Math.random())
        let id: string = hash.toString(CryptoJS.enc.Base64)
        var queryParams = {
            TableName: 'Coupon',
            Item: {
                id: id,
                name: params.name,
                description: params.description,
                goods: params.goods,
                endDate: params.endDate,
                issued: 0,
                limit: Number(params.limit),
                imgs: params.img,
                paymentCondition: params.paymentCondition
            },
            ConditionExpression: "attribute_not_exists(id)"      //항목 추가하기 전에 이미 존재하는 항목이 있을 경우 pk가 있을 때 조건 실패. pk는 반드시 있어야 하므로 replace를 방지
        }
        const run = async() => {
            try{
                console.log(`DB 요청 params\n${JSON.stringify(queryParams, null, 2)}`)
                let result = await this.Dynamodb.put(queryParams).promise()
                this.res.locals.coupons.push(queryParams.Item)
                this.res.locals.cids.push(id)
                console.log(`등록 완료,\n 생성된 쿠폰 id : ${id}`)
                // let result = {
                //     result: 'success',
                //     message: {
                //         'id': id
                //     }
                // }
                // this.res.status(201).send(result)
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
                fail.error = error.invalReq
                fail.errdesc = err
                this.res.status(521).send(fail)
            }
        }
        return run
    }
}