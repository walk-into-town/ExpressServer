import { FeatureManager } from "./FeatureManager";
import {Monster} from '../../models/Monster'
import { error, fail, success } from "../../static/result";

export default class MonsterManager extends FeatureManager{
    public insert(params: any): void {
        params.number = parseInt(params.number)
        var queryParams = {
            TableName: 'Monster',
            Key: {'number': 100},
            UpdateExpression: 'set imgs = list_append(imgs, :newimgs)',
            ExpressionAttributeValues: {':newimgs': params.imgs},
            ExpressionAttributeNames: {'#number' : 'number'},
            ReturnValues: 'UPDATED_NEW',
            ConditionExpression: "attribute_exists(#number)"
        }
        const run = async() => {
            try{
                let data = await this.Dynamodb.update(queryParams).promise()
                success.data = data.Attributes.imgs
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
    public read(params: any): void {
        let queryParams = {
            TableName: 'Monster',
            KeyConditionExpression: '#number = :number',
            ExpressionAttributeNames: {'#number': 'number'},
            ProjectionExpression: 'imgs',
            ExpressionAttributeValues: {':number': Number(params.number)},
        }
        const run = async() => {
            try{
                let result = await this.Dynamodb.query(queryParams).promise()
                console.log(result.Items[0].imgs)
                success.data = result.Items[0].imgs
            }
            catch(err){
                fail.error = error.dbError
                fail.errdesc = err
                this.res.status(400).send(fail)
            }
        }
        run()
    }
    public update(params: any): void {
        throw new Error("Method not implemented.");
    }
    public delete(params: any): void {
        throw new Error("Method not implemented.");
    }
    
}