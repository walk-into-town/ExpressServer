import { FeatureManager } from "./FeatureManager";
import * as CryptoJS from 'crypto-js'
import {success, fail, error} from '../../static/result'


export default class PinpointManager extends FeatureManager{
    /**
     * 핀포인트 등록 로직
     * 1. 핀포인트 이름, 위/경도로 hash id 생성
     * 2. 해당 id를 이용해 DB Insert
     * 3. ConditionExpression을 통해 id가 중복되면 실패
     */
    public insert(params: any): void {
        let date = new Date()
        let hash = CryptoJS.SHA256(params.name + params.latitude.toString() + params.longitude.toString() + date.toString())  //id 생성
        params.id = hash.toString(CryptoJS.enc.Base64)
        let checkCouponParams = {                   // 쿠폰 id 체크 파라미터
            TableName: 'Coupon',
            KeyConditionExpression: 'id = :id',
            ExpressionAttributeValues: {
                ':id' : params.coupons
            }
        }

        let queryParams = {
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
                if(params.coupons != undefined){                // 핀포인트 쿠폰이 있는경우 쿠폰 유효성 파악                
                    let checkCoupon = await this.Dynamodb.query(checkCouponParams).promise()
                    if(checkCoupon.Items[0] == undefined){     //data.Item == undefined -> 해당하는 ID가 없음
                        console.log(`핀포인트 쿠폰 체크\nDB 요청 Params\n${JSON.stringify(queryParams, null, 2)}`)
                        fail.error = error.invalKey
                        fail.errdesc = "Coupon you send does not exist in DB"
                        this.res.status(400).send(fail)
                        return;
                    }
                }

                this.res.locals.id = params.id
                let queryResult = await this.Dynamodb.put(queryParams).promise()
                success.result = params.id
                this.res.status(201).send(success)
                console.log(`응답 JSON\n${JSON.stringify(success, null, 2)}`)
            }
            catch(err){
                fail.error = error.dbError
                fail.errdesc = err
                this.res.status(400).send(fail)
            }
        }
        run()

    }

    /**
     * 핀포인트 조회 로직
     * batchGet을 사용 -> 핀포인트 목록조회와 일반 조회 모두 같은 함수로 통일
     * 1. batchget을 통해 DB에서 핀포인트를 가져옴
     * 2. 사용자에게 전달
     */
    public read(params: any): void {
        if(params[0].id == undefined){
            fail.error = error.invalReq
            fail.errdesc = 'Missing Required Values in Request. Please check API Document'
            this.res.status(400).send(fail)
            return;
        }
        let queryParams = {
            RequestItems:{
                'Pinpoint':{
                    Keys: params
                }
            }
        }
        const run = async () => {              //batch 조회를 수행하기 때문에 비동기 함수를 사용
            try{
                await this.Dynamodb.batchGet(queryParams, this.onRead.bind(this)).promise()  // read를 수행할때 까지 대기
                if(this.res.locals.UnprocessedKeys != undefined){              //오류 발생 처리
                    fail.error = error.dbError
                    fail.errdesc = 'None of Keys are processed'
                    this.res.status(400).send(fail)
                }
                success.data = this.res.locals.result.Pinpoint
                this.res.status(201).send(success)
            }
            catch(err){
                fail.error = error.dbError
                fail.errdesc = err
                this.res.status(400).send(fail)
            }
        }
        run()
     }

     public readList(params: any): void{
        let id = params.id
        let queryParams = {
            TableName: 'Campaign',
            KeyConditionExpression: 'id = :id',
            ProjectionExpression: 'pinpoints',
            ExpressionAttributeValues: { ':id' : id}
        }
        const run = async () => {
            let queryResult = await this.Dynamodb.query(queryParams).promise()
            console.log(queryResult)
        }
        run()
     }
    
    private onRead(err: object, data: any): void{
        if(err){
            fail.error = error.dbError
            fail.errdesc = err
            this.res.status(400).send(fail)
        }
        else{
            this.res.locals.result = data
        }
    }

    /**
     * 핀포인트 수정 로직
     * 1. 핀포인트 update수행
     * 2. 성공 /실패 메시지 전달
     */
    public update(params: any): void {
        let queryParams = {
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
            fail.error = error.dbError
            fail.errdesc = err
            this.res.status(400).send(fail)
        }
        else{
            success.data = data.Attributes
            this.res.status(201).send(success)
        }
    }

    /**
     * 핀포인트 삭제 로직
     * 1. 사용자 입력 값으로 핀포인트 삭제
     * 2. ReturnValues를 통해 삭제 전 항목을 받아
     * 3. 사용자에게 전달
     */

    public delete(params: any): void {
        let queryParams = {
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
            fail.error = error.dbError
            fail.errdesc = err
            this.res.status(401).send(fail)
        }
        else{
            success.data = data.Attributes
            this.res.status(200).send(success)
        }
    }


    /**
     * 핀포인트 상세 정보 API
     */
    

    /**
     * 핀포인트 상세 조회 로직
     * 1. 사용자로부터 입력받은 값으로 get 수행
     * 2. ProjectionExpression을 통해 상세 설명만 가져옴
     * 3. 사용자에게 전달
     */
    public readDetail(params: any): void{
        let queryParams = {
            TableName: 'Pinpoint',
            Key: {
                'id': params.id
            },
            ProjectionExpression: 'description'
        }
        this.Dynamodb.get(queryParams, this.onReadDetail.bind(this))
    }
    
    private onReadDetail(err: object, data: any): void{
        if(err){
            fail.error = error.dbError
            fail.errdesc = err
            this.res.status(400).send(fail)
            return;
        }
        if(data.Item == undefined){
            fail.error = error.invalKey
            fail.errdesc = 'Provided Pinopint Key does not match'
            this.res.status(400).send(fail)
        }
        else{
            success.data = data.Item
            this.res.status(201).send(success)
        }

    }

    /**
     * 핀포인트 상세정보 수정 로직
     * 1. 사용자로부터 값 받기
     * 2. ConditionExpression을 통해 이미 존재하는 핀포인트에 대해서만 수행
     *    => DynamoDB에서는 일치하는 Key가 없는 경우 자동으로 Insert
     * 3. 사용자에게 결과 전달
     */
    public updateDetail(params: any): void{
        let queryParams = {
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
            fail.error = error.dbError
            fail.errdesc = err
            this.res.status(400).send(fail)
        }
        else{
            success.data = data.Attributes
            this.res.status(201).send(success)
        }
    }


    /**
     * 핀포인트 퀴즈 API
     */

    /**
     * 퀴즈 등록 로직
     * 1. 사용자로부터 값 받음
     * 2. RetrunValues를 통해 생성된 값 + ConditionExpression을 통해 없는 항목에만 등록
     * 3. 사용자에게 결과 전달
     */
    public insertQuiz(params: any): void{
        let queryParams = {
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
            fail.error = error.dbError
            fail.errdesc = err
            this.res.status(400).send(fail)
        }
        else{
            success.data = data.Attributes
            this.res.status(201).send(success)
        }
    }

    /**
     * 퀴즈 조회 로직
     * 1. 사용자로부터 값 수신
     * 2. ProjectionExpression을 통해 퀴즈만 가져옴
     * 3. 사용자에게 전달
     */
    public readQuiz(params: any): void{
        let queryParams = {
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
            fail.error = error.dbError
            fail.errdesc = err
            this.res.status(400).send(fail)
        }
        else{
            success.data = data.Item
            this.res.status(201).send(success)
        }
    }

    /**
     * 퀴즈 수정 로직
     * 1. 사용자로부터 값 수신
     * 2. ReturnValues를 통해 새로 생성된 항목 받기
     * 3. ConditionExpression을 통해 이미 존재하는 항목만 수정
     * 4. 사용자에게 결과 전달
     */
    public updateQuiz(params: any): void{
        let queryParams = {
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
            fail.error = error.dbError
            fail.errdesc = err
            this.res.status(400).send(fail)
        }
        else{
            success.data = data.Attributes
            this.res.status(201).send(success)
        }
    }

    /**
     * 핀포인트 댓글 API
     */

    /**
     * 핀포인트 댓글 등록 API
     * 1. 사용자 id와 세션에 저장된 id 확인
     * 2. 핀포인트 id + 시간으로 댓글 id 생성
     * 3. rated = 0으로 설정
     * 4. DB 등록 후 결과 반환
     */
    public insertComment(params: any): void{
        let userid = this.req.session.passport.user.id
        let date = new Date()
        let hash = CryptoJS.SHA256(params.pid + date.toString())  //id 생성
        params.id = hash.toString(CryptoJS.enc.Base64)
        if(userid != params.comments.userId){   //세션의 id와 전송한 id가 다른 경우
            fail.error = error.invalKey
            fail.errdesc = 'User Id does not match with session'
            this.res.status(400).send(fail)
        }
        let comment = [{
            id: params.id,
            userId: userid,
            text: params.comments.text,
            rated: 0,
            imgs: params.imgs
        }]
        let queryParams = {
            TableName: 'Pinpoint',
            Key: {id: params.pid},
            UpdateExpression: 'set comments = list_append(if_not_exists(comments, :emptylist), :newcomment)',
            ExpressionAttributeValues: {':newcomment': comment, ':emptylist': []},
            ReturnValues: 'UPDATED_NEW',
            ConditionExpression: "attribute_exists(id)"
        }
        const run = async() => {
            try{
                let queryResult = await this.Dynamodb.update(queryParams).promise()
                success.data = queryResult.Attributes
                this.res.status(200).send(success)
            }
            catch(err){
                fail.error = error.dbError
                fail.errdesc = err
                this.res.status(400).send(fail)
            }
        }
        run();
    }

    public readComment(params: any): void{
        let id = params.id
        let queryParams = {
            TableName: 'Pinpoint',
            KeyConditionExpression: 'id = :id',
            ProjectionExpression: 'comments',
            ExpressionAttributeValues: { ':id' : id}
        }
        const run = async() => {
            try{        
                let result = await this.Dynamodb.query(queryParams).promise()
                success.data = result.Items[0].comments
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

    /**
     * 핀포인트 댓글 삭제 로직
     * 1. 핀포인트 id를 이용해 댓글을 가져옴
     * 2. for문을 돌며 댓글 id가 일치하는 항목을 삭제
     * 3. 성공 메시지 출력
     */
    public deleteComment(params: any): void{
        let pid = params.pid
        let findParams = {
            TableName: 'Pinpoint',
            KeyConditionExpression: 'id = :id',
            ProjectionExpression: 'comments',
            ExpressionAttributeValues: { ':id' : pid}
        }
        let updateParams = {
            TableName: 'Pinpoint',
            Key: {id: params.pid},
            UpdateExpression: 'set comments = :newcomment',
            ExpressionAttributeValues: {':newcomment': null},
            ReturnValues: 'UPDATED_NEW',
            ConditionExpression: "attribute_exists(id)"
        }
        const run = async () => {
            try{
                let comments = await this.Dynamodb.query(findParams).promise()
                for(let i =0; i < comments.Items[0].comments.length; i++){
                    let cid = comments.Items[0].comments[i].id
                    let uid = comments.Items[0].comments[i].userId
                    if(cid == params.cid && uid == params.uid){
                        comments.Items[0].comments.splice(i,1);
                        break;
                    }
                }
                console.log('댓글 찾는중...')
                console.log(comments.Items[0].comments)
                updateParams.ExpressionAttributeValues[":newcomment"] = comments.Items[0].comments
                let updateResult = await this.Dynamodb.update(updateParams).promise()
                success.data = updateResult
                this.res.status(200).send(success)
            }
            catch(err){
                fail.error = error.dbError
                fail.errdesc = err
                this.res.status(400).send(fail)
            }
        }
        run();
    }

    public updateComment(params: any): void{
        let pid = params.pid
        let findParams = {
            TableName: 'Pinpoint',
            KeyConditionExpression: 'id = :id',
            ProjectionExpression: 'comments',
            ExpressionAttributeValues: { ':id' : pid}
        }
        let updateParams = {
            TableName: 'Pinpoint',
            Key: {id: params.pid},
            UpdateExpression: 'set comments = :newcomment',
            ExpressionAttributeValues: {':newcomment': null},
            ReturnValues: 'UPDATED_NEW',
            ConditionExpression: "attribute_exists(id)"
        }
        const run = async () => {
            try{
                let comments = await this.Dynamodb.query(findParams).promise()
                console.log('댓글 찾는중...')
                for(let i =0; i < comments.Items[0].comments.length; i++){
                    let cid = comments.Items[0].comments[i].id
                    let uid = comments.Items[0].comments[i].userId
                    if(cid == params.cid && uid == params.uid){
                        console.log('조건 만족')
                        comments.Items[0].comments[i].text = params.text;
                        break;
                    }
                }
                console.log(comments.Items[0].comments)
                updateParams.ExpressionAttributeValues[":newcomment"] = comments.Items[0].comments
                console.log('댓글 수정중...')
                let updateResult = await this.Dynamodb.update(updateParams).promise()
                success.data = updateResult
                this.res.status(200).send(success)
            }
            catch(err){
                fail.error = error.dbError
                fail.errdesc = err
                this.res.status(400).send(fail)
            }
        }
        run();
    }

    public updateRate(params: any): void{
        let pid = params.pid
        let findParams = {
            TableName: 'Pinpoint',
            KeyConditionExpression: 'id = :id',
            ProjectionExpression: 'comments',
            ExpressionAttributeValues: { ':id' : pid}
        }
        let updateParams = {
            TableName: 'Pinpoint',
            Key: {id: params.pid},
            UpdateExpression: 'set comments = :newcomment',
            ExpressionAttributeValues: {':newcomment': null},
            ReturnValues: 'UPDATED_NEW',
            ConditionExpression: "attribute_exists(id)"
        }
        const run = async () => {
            try{
                let comments = await this.Dynamodb.query(findParams).promise()
                console.log('댓글 찾는중...')
                for(let i =0; i < comments.Items[0].comments.length; i++){
                    let cid = comments.Items[0].comments[i].id
                    let uid = comments.Items[0].comments[i].userId
                    if(cid == params.cid && uid == params.uid){
                        console.log('조건 만족')
                        if(params.like == true){
                            comments.Items[0].comments[i].rated += 1;
                            break;
                        }
                        else{
                            comments.Items[0].comments[i].rated -= 1;
                            break;
                        }
                    }
                }
                console.log(comments.Items[0].comments)
                updateParams.ExpressionAttributeValues[":newcomment"] = comments.Items[0].comments
                console.log('댓글 수정중...')
                let updateResult = await this.Dynamodb.update(updateParams).promise()
                success.data = updateResult
                this.res.status(200).send(success)
            }
            catch(err){
                fail.error = error.dbError
                fail.errdesc = err
                this.res.status(400).send(fail)
            }
        }
        run();
    }
}