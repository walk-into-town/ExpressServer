import { error, fail, success } from "../../static/result";
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
                    let memberResult = await this.Dynamodb.query(memberParams).promise()
                    let member = memberResult.Items[0]
                    ranking.nickname = member.nickname
                    ranking.profileImg = member.profileImg
                    this.res.status(200).send(ranking)
                    return                        
                }
                catch(err){
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
                    ranking = await rankingSort(ranking)
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
                    success.data = ranking
                    this.res.status(200).send(success)
                    return;
                }
                catch(err){
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
        throw new Error("Method not implemented.");
    }
    public delete(params: any): void {
        throw new Error("Method not implemented.");
    }
    
}