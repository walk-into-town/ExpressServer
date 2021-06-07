import { error, fail, success } from "../../static/result";
import { successInit } from "../Logics/responseInit";
import { rankingSort } from "../Logics/Sorter";
import { FeatureManager, toRead } from "./FeatureManager";

export default class Rankingmanager extends FeatureManager{
    public insert(params: any): void {
        let rankParam = {
            TableName: 'Ranking',
            Key: {userId: this.req.session.passport.user.id},
            UpdateExpression: 'add cleared :clear',
            ExpressionAttributeValues: {':clear': 1}
        }
        const run = async() => {
            this.Dynamodb.update(rankParam, function(err, data){
                if(err){
                    throw err
                }
            })
        }
        run();
    }
    public read(params: any): void {
        let uid = this.req.session.passport.user.id
        if(params.type == 'single'){
            let queryParams = {
                TableName: 'Ranking',
                KeyConditionExpression: 'userId = :id',
                ExpressionAttributeValues: {':id': uid}
            }
            let memberParams = {
                TableName: 'Member',
                KeyConditionExpression: 'id = :id',
                ExpressionAttributeValues: {':id': uid},
                ProjectionExpression: 'nickname, profileImg'
            }
            const run = async() => {
                try{
                    let result = await this.Dynamodb.query(queryParams).promise()
                    let ranking = result.Items[0]
                    if(ranking == undefined){
                        ranking = []
                    }
                    let memberResult = await this.Dynamodb.query(memberParams).promise()
                    let member = memberResult.Items[0]
                    ranking.nickname = member.nickname
                    ranking.profileImg = member.profileImg
                    success.data = ranking
                    this.res.status(200).send(success)
                    return                        
                }
                catch(err){
                console.log(err)
                    fail.error = error.dbError
                    fail.errdesc = err
                    this.res.status(521).send(fail)
                }
            }
            run()
            return;
        }
        if(params.type == 'list'){
            let queryParams = {
                TableName: 'Ranking'
            }
            let memberparams = {
                RequestItems: {
                    'Member': {
                        Keys: [],
                        ProjectionExpression: 'nickname, profileImg, id'
                    }
                }
            }
            const run = async() => {
                try{
                    let result = await this.Dynamodb.scan(queryParams).promise()
                    let ranking = []
                    for(const item of result.Items){
                        ranking.push(item)
                    }
                    if(ranking.length == 0){
                        success.data = []
                        this.res.status(200).send(success)
                        return;
                    }
                    ranking.sort(rankingSort)
                    for(const rank of ranking){
                        memberparams.RequestItems.Member.Keys.push({id: rank.userId})
                    }
                    let memberResult = await this.Dynamodb.batchGet(memberparams).promise()
                    let member = memberResult.Responses.Member
                    for(const rank of ranking){
                        for(let i = 0; i < member.length; i++){
                            if(rank.userId == member[i].id){
                                rank.nickname = member[i].nickname
                                rank.profileImg = member[i].profileImg
                                member.splice(i, 0)
                                break;
                            }
                        }
                    }
                    ranking.sort(rankingSort)
                    success.data = ranking
                    this.res.status(200).send(success)
                    successInit(success)
                    return;
                }
                catch(err){
                console.log(err)
                    fail.error = error.dbError
                    fail.errdesc = err
                    this.res.status(521).send(fail)
                }
            }
            run()
            return;
        }
        fail.error = error.invalReq
        fail.errdesc = 'type은 single | list 중 하니이어야 합니다.'
        this.res.status(400).send(fail)
    }
    public update(params: any): void {
        let queryParams = {
            TableName: 'Ranking'
        }
        let updateParams = {
            TableName: 'Ranking',
            Key: {'userId': null},
            UpdateExpression: 'set #rank = :newrank',
            ExpressionAttributeValues: {':newrank': null},
            ExpressionAttributeNames: {'#rank': 'rank'}
        }
        const run = async() => {
            let rankResult = await this.Dynamodb.scan(queryParams).promise()
            let ranks = []
            for(const rank of rankResult.Items){
                ranks.push(rank)
            }
            ranks.sort(rankingSort)
            for(let i =0; i < ranks.length; i++){           // 전체 정렬된 랭킹에 대하여
                if(i == 0){                                 // 배열의 0번째 원소 = 1등
                    ranks[0].rank = 1
                    continue
                }
                if(ranks[i].cleared == ranks[i-1].cleared){ // 이번 요소와 이전 요소의 클리어 수가 동일 = 같은 순위로 설정
                    ranks[i].rank = ranks[i-1].rank
                    continue
                }
                ranks[i].rank = i + 1;
            }
            for(const rank of ranks){
                updateParams.Key.userId = rank.userId
                updateParams.ExpressionAttributeValues[":newrank"] = rank.rank
                await this.Dynamodb.update(updateParams).promise()
            }
            console.log('랭킹 갱신 성공')
        }
        run()
        return;
    }
    public delete(params: any): void {
        throw new Error("Method not implemented.");
    }   
}