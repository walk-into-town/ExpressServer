import { FeatureManager } from "./FeatureManager";
import {Monster} from '../../models/Monster'

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
                let result = {
                    result: 'success',
                    message: data.Attributes.imgs
                }
                this.res.status(200).send(result)
            }
            catch(err){
                let result = {
                    result: 'failed',
                    error: 'DB Error. Please Connect Manager',
                    errcode: err
                }
                this.res.status(400).send(result)
            }
        }
        run()
    }
    public read(params: any): void {
        throw new Error("Method not implemented.");
    }
    public update(params: any): void {
        throw new Error("Method not implemented.");
    }
    public delete(params: any): void {
        throw new Error("Method not implemented.");
    }
    
}