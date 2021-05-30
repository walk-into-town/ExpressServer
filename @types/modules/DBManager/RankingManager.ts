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
        if(params.type == 'single'){
            let queryParams = {
                TableName: 'Ranking',
                KeyConditionExpression: 'userId = :id',
                ExpressionAttributeValues: {':id': this.req.session.passport.user.id}
            }
            const run = async() => {
                try{
                    let result = await this.Dynamodb.query(queryParams).promise()
                    success.data = result.Items[0]
                    this.res.status(200).send(success)
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
            const run = async() => {
                try{
                    let result = await this.Dynamodb.scan(queryParams).promise()
                    let ranking = []
                    for(const item of result.Items){
                        ranking.push(item)
                    }
                    ranking = await rankingSort(ranking)
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