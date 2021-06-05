import { error, fail, success } from "../../static/result";
import * as CryptoJS from 'crypto-js'
import { FeatureManager, toRead } from "./FeatureManager";
import { nbsp2plus } from "../Logics/nbsp";

export default class Reportmanager extends FeatureManager{
    public insert(params: any): void {
        let hash = CryptoJS.SHA256(Date().toString() + params.targetId + Math.random())
        let id: string = hash.toString(CryptoJS.enc.Base64)
        let targetId: string = params.targetId
        let userId: string = this.req.session.passport.user.id
        let targetUser: string = params.targetUser
        let description: string = params.description
        let type: string = params.type
        let typeId: string = params.typeId
        let processed: boolean = false
        let date = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString()
        
        let getParam = {
            TableName: params.type,
            KeyConditionExpression: 'id = :id',
            ExpressionAttributeValues: {':id': typeId},
            ProjectionExpression: 'comments'
        }
        let memberParam = {
            TableName: 'Member',
            KeyConditionExpression: 'id = :id',
            ExpressionAttributeValues: {':id': targetUser}
        }
        let reportParam = {
            TableName: 'Report'
        }
        let insertParams = {
            TableName: 'Report',
            Item: {
                id: id,
                targetId: targetId,
                description: description,
                userId: userId,
                targetUser: targetUser,
                date: date,
                type: type,
                processed: processed
            },
            ConditionExpression: "attribute_not_exists(id)"      //항목 추가하기 전에 이미 존재하는 항목이 있을 경우 pk가 있을 때 조건 실패. pk는 반드시 있어야 하므로 replace를 방지
        }
        const run = async () => {
            try{
                console.log('요청 유효성 검사중')
                console.log('type 유효성 검사중')
                if(type != 'Campaign' && type != 'Pinpoint'){       // type이 잘못된 경우
                    console.log('잘못된 type')
                    fail.error = error.typeMiss
                    fail.errdesc = 'type은 Campaign || Pinpoint 중 하나여야 합니다.'
                    this.res.status(400).send(fail)
                    return;
                }
                console.log('type 유효성 검사 통과')
                console.log('typeId 유효성 검사중')
                let result = await this.Dynamodb.query(getParam).promise()
                if(result.Items[0] == undefined){
                    console.log('typeid를 찾을 수 없습니다.');
                    fail.error = error.dataNotFound
                    fail.errdesc = 'typeid를 찾을 수 없습니다.'
                    this.res.status(400).send(fail)
                    return;
                }
                console.log('targetUser 유효성 검사중')
                let memberResult = await this.Dynamodb.query(memberParam).promise()
                if(memberResult.Items[0] == undefined){
                    fail.error = error.dataNotFound
                    fail.errdesc = 'targetUser를 찾을 수 없습니다.'
                    this.res.status(400).send(fail)
                    return;
                }
                console.log('targetUser 유효성 검사 통과')
                let comments: Array<any> = result.Items[0].comments
                console.log('typeId 유효성 검사 통과')
                console.log('targetId 유효성 검사중')
                for(let i =0; i < comments.length; i++){
                    if(comments[i].id == targetId){
                        if(comments[i].userId != targetUser){
                            console.log('targetUser가 잘못되었습니다.')
                            fail.error = error.invalReq
                            fail.errdesc = 'targetUser가 잘못되었습니다.'
                            this.res.status(400).send(fail)
                            return
                        }
                        console.log('targetId 유효함')
                        break;
                    }
                    if(i == comments.length - 1){
                        console.log('targetId를 찾을 수 없습니다.')
                        fail.error = error.dataNotFound
                        fail.errdesc = 'targetId를 찾을 수 없습니다.'
                        this.res.status(400).send(fail)
                        return;
                    }
                }
                console.log('targetId 요효성 검사 통과')
                console.log('중복 신고 여부 확인중')
                let reportResult = await this.Dynamodb.scan(reportParam).promise()
                let reports = reportResult.Items
                for(const report of reports){
                    if(report.targetId == targetId && report.targetUser == targetUser && report.userId == userId){
                        fail.error = error.invalReq
                        fail.errdesc = '이미 신고하신 댓글입니다.'
                        this.res.status(400).send(fail)
                        return;
                    }
                }
                console.log('신고 등록 시작')
                await this.Dynamodb.put(insertParams).promise()
                console.log('신고 등록 성공')
                success.data = id
                this.res.status(201).send(success)
            }
            catch(err){
                fail.error = error.dbError
                fail.errdesc = err
                this.res.status(521).send(fail)
            }
        }
        run()
    }
    public read(params: any, ReadType?: toRead): void {
        params.type = nbsp2plus(params.type)
        let type = params.type
        if(type != 'list' && type != 'single'){
            fail.error = error.typeMiss
            fail.errdesc = 'type은 list | single 중 하나여야합니다.'
            this.res.status(400).send(fail)
            return;
        }
        const run = async() => {
            try{
                if(type == 'list'){
                    let queryParams = {
                        TableName: 'Report'
                    }
                    let result = await this.Dynamodb.scan(queryParams).promise()
                    success.data = result.Items
                    this.res.status(200).send(success)
                    return;
                }
                else{
                    params.reid = nbsp2plus(params.reid)
                    let queryParams = {
                        TableName: 'Report',
                        KeyConditionExpression: 'id = :id',
                        ExpressionAttributeValues: {':id': params.reid}
                    }
                    let result = await this.Dynamodb.query(queryParams).promise()
                    if(result.Items[0] == undefined){
                        fail.error = error.dataNotFound
                        fail.errdesc = '신고를 찾을 수 없습니다.'
                        this.res.status(400).send(fail)
                        return;
                    }
                    success.data = result.Items[0]
                    this.res.status(200).send(success)
                }
            }
            catch(err){
                fail.error = error.dbError
                fail.errdesc = err
                this.res.status(521).send(fail)
            }
        }
        run()
    }
    public update(params: any): void {
        let id = params.reid
        let uid = this.req.session.passport.user.id
        let time = Number(params.time)
        let targetUser = params.targetUser
        let startTime = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString()
        if(time < 0 || params.time == undefined){
            console.log('시간이 잘못되었습니다.')
            fail.error = error.invalReq
            fail.errdesc = '시간이 잘못되었습니다.'
            this.res.status(400).send(fail)
            return;
        }
        let reportParam = {
            TableName: 'Report',
            KeyConditionExpression: 'id = :id',
            ExpressionAttributeValues: {':id': params.reid}
        }
        let insertParam = {
            TableName: 'Prison',
            Item: {
                id: targetUser,
                time: time,
                startTime: startTime
            },
            ConditionExpression: "attribute_not_exists(id)"      //항목 추가하기 전에 이미 존재하는 항목이 있을 경우 pk가 있을 때 조건 실패. pk는 반드시 있어야 하므로 replace를 방지
        }
        let updateParam = {
            TableName: 'Report',
            Key: {id: id},
            UpdateExpression: 'set #processed = :processed',
            ExpressionAttributeValues: {':processed': true},
            ExpressionAttributeNames: {'#processed': 'processed'}
        }
        const run = async() => {
            try{
                let result = await this.Dynamodb.query(reportParam).promise()
                if(result.Items[0] == undefined){
                    fail.error = error.dataNotFound
                    fail.errdesc = '신고를 찾을 수 없습니다.'
                    this.res.status(400).send(fail)
                    return;
                }
                if(result.Items[0].targetUser != targetUser){
                    fail.error = error.invalReq
                    fail.errdesc = '잘못된 targetUser입니다.'
                    this.res.status(400).send(fail)
                    return;
                }
                await this.Dynamodb.put(insertParam).promise()
                await this.Dynamodb.update(updateParam).promise()
                success.data = '신고 처리 완료!'
                this.res.status(201).send(success)
            }
            catch(err){
                fail.error = error.dbError
                fail.errdesc = err
                this.res.status(521).send(fail)
            }
        }
        run()
    }
    public delete(params: any): void {
        throw new Error("Method not implemented.");
    }

}