import { FeatureManager} from "./FeatureManager";
import * as CryptoJS from 'crypto-js'
import { error, fail, success } from "../../static/result";
import {nbsp2plus} from '../Logics/nbsp'

export default class CouponManager extends FeatureManager{
    /**
     * 쿠폰 등록 로직
     * 1. 상품의 수와 발급 제한 개수가 동일한지 확인
     * 2. 현재 시각을 이용해 id 생성
     * 3. DB에 추가
     * 4. 쿼리 결과에 따라 사용자에게 응답
     */
    public insert(params: any): void {
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
                img: params.img,
                paymentCondition: params.paymentCondition
            },
            ConditionExpression: "attribute_not_exists(id)"      //항목 추가하기 전에 이미 존재하는 항목이 있을 경우 pk가 있을 때 조건 실패. pk는 반드시 있어야 하므로 replace를 방지
        }
        const run = async() => {
            try{
                await this.Dynamodb.put(queryParams).promise()
                this.res.locals.coupons.push(queryParams.Item)
                // let result = {
                //     result: 'success',
                //     message: {
                //         'id': id
                //     }
                // }
                // this.res.status(201).send(result)
            }
            catch(err){                 //DB에러 발생
                fail.error = error.dbError
                fail.errdesc = err
                this.res.status(521).send(fail)
            }
        }
        run()
    }

    /**
     * 쿠폰 조회 로직
     * 1. params.type에 읽을 방식 결정 coupon || campaign
     * 2. type에 따라 쿼리 파라메터 작성
     * 3. 쿼리 실행 후 결과 출력
     */
    public read(params: any): void {
        params.value = nbsp2plus(params.value)
        let queryParams = {
            TableName: 'Coupon',
            KeyConditionExpression: 'id = :id',
            ExpressionAttributeValues: {':id': params.value,}
        }
        const run = async() => {
            try{ 
                let queryResult = await this.Dynamodb.query(queryParams).promise()
                success.data = queryResult.Items
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

    public readList(params: any): void{
        params.value = nbsp2plus(params.value)
        let checkParams = {
            TableName: '',
            KeyConditionExpression: 'id = :id',
            ExpressionAttributeValues: {':id': params.value},
            ProjectionExpression: 'coupons, pcoupons'
        }
        if(params.type == 'campaign'){
            checkParams.TableName = 'Campaign'
        }
        else if(params.type == 'pinpoint'){
            checkParams.TableName = 'Pinpoint'
        }
        const run = async() => {
            try{
                let result = await this.Dynamodb.query(checkParams).promise()
                let couponParams = {
                    RequestItems:{
                        'Coupon':{
                            Keys: null
                        }
                    }
                }
                if(params.type == 'campaign'){
                    let coupon:Array<string> = result.Items[0].coupons
                    let pcoupons:Array<string> = result.Items[0].pcoupons
                    let couponList: Array<object> = []
                    if(coupon.length == 0 && pcoupons.length == 0){
                        success.data = []
                        this.res.status(200).send(success)
                        return;
                    }
                    for (const id of coupon) {
                        pcoupons.push(id)
                    }
                    pcoupons.forEach(coupon => {
                        let obj = {
                            id: coupon
                        }
                        couponList.push(obj)
                    })
                    console.log(couponList)
                    couponParams.RequestItems.Coupon.Keys = couponList
                }
                else{
                    let coupon: Array<string> = result.Items[0].coupons
                    let couponList: Array<object> = []
                    if(coupon.length == 0){
                        success.data = []
                        this.res.status(200).send(success)
                        return;
                    }
                    for(const id of coupon){
                        let obj = {
                            id: id
                        }
                        couponList.push(obj)
                    }
                    console.log(couponList)
                    couponParams.RequestItems.Coupon.Keys = couponList
                }
                
                let queryResult = await this.Dynamodb.batchGet(couponParams).promise()
                let coupons = queryResult.Responses.Coupon
                for (const coupon of coupons) {
                    delete coupon.paymentCondition
                }
                success.data = coupons
                this.res.status(200).send(success)
            }
            catch(err){
                fail.error = error.dbError
                fail.errdesc = err
                this.res.status(521).send(fail)
            }
        }
        run()
    }

    /**
     * 쿠폰 수정 로직
     * 1. 입력한 쿼리를 바탕으로 update parameter 생성
     * 2. 생성한 파라메터로 update 수행
     * 3. 결과 전송
    */
    public update(params: any): void {
        this.queryGen(params)
    }

    private queryGen(params: any) {
        let queryArray: Array<string> = []
        let updateExp: string = 'set '
        let expAttrNames = undefined
        if(params.description != undefined){
            let query = 'description = :newdesc'
            queryArray.push(query)
        }
        if(params.goods != undefined){
            let query = 'goods = :newgoods'
            queryArray.push(query)
        }
        if(params.endDate != undefined){
            let query = 'enddate = :newend'
            queryArray.push(query)
        }
        if(params.limit != undefined){
            let query = '#limit = :newlimit'
            expAttrNames = {'#id' : 'id'}
            queryArray.push(query)
        }
    
        for(let i =0; i < queryArray.length-1; i++){
            updateExp = updateExp + queryArray.pop() + ', '
        }
        updateExp += queryArray.pop();
        console.log(updateExp)
    }

    /**
     * 쿠폰 삭제 로직
     * 1. id 입력 받기
     * 2. db 삭제 요청
     * 3. 결과에 따라 값 반환
     */
    public delete(params: any): void {
        console.log(params)
        var queryParams = {
            TableName: 'Coupon',
            Key: {
                'id': params.id
            },
            ReturnValues: 'ALL_OLD'
        }
        const run = async () => {
            try{
            let dbResult = await this.Dynamodb.delete(queryParams).promise()
            if(dbResult.Attributes == undefined){
                success.data = []
            }
            else{
                success.data = dbResult.Attributes
            }
            this.res.status(200).send(success)
            }
            catch(err){
                fail.error = error.dbError
                fail.errdesc = err
                this.res.status(521).send(fail)
            }
        }
        run()
    }

    public useCoupon(params: any): void{
        let id = this.req.session.passport.user.id
        let queryParams = {
            TableName: 'Member',
            KeyConditionExpression: 'id = :id',
            ProjectionExpression: 'coupons',
            ExpressionAttributeValues: {':id': id}
        }
        let updateParams = {
            TableName: 'Member',
            Key: {'id': id},
            UpdateExpression: 'set coupons = :newcoupons',
            ExpressionAttributeValues: {':newcoupons': null}
        }
        const run = async() => {
            let result = await this.Dynamodb.query(queryParams).promise()
            let coupons: Array<any> = result.Items[0].coupons
            if(coupons.length == 0){
                fail.error = error.invalReq
                fail.errdesc = '사용 가능한 쿠폰이 없습니다.'
                this.res.status(400).send(fail)
                return;
            }
            for(const coupon of coupons){
                if(coupon.id == params.cid && coupon.used == false){
                    if(coupon.endDate < new Date().toISOString()){
                        fail.error = error.invalReq
                        fail.errdesc = '유효기간 초과'
                        this.res.status(400).send(fail)
                        return;
                    }
                    coupon.used = true;
                    success.data = '쿠폰 사용 성공'
                    updateParams.ExpressionAttributeValues[":newcoupons"] = coupons
                    await this.Dynamodb.update(updateParams).promise()
                    this.res.status(201).send(success)
                    return;
                }
            }
            fail.error = error.invalReq
            fail.errdesc = '이미 사용하거나 없는 쿠폰입니다.'
            this.res.status(400).send(fail)
        }
        run()
    }
}