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
    public read(params: any): void {
        let queryParams = {
            TableName: 'Monster',
            KeyConditionExpression: '#number = :number',
            ExpressionAttributeNames: {'#number': 'number'},
            ProjectionExpression: 'imgs',
            ExpressionAttributeValues: {':number': Number(params.number)},
        }
        console.log(`요청 JSON\n${JSON.stringify(queryParams, null, 2)}`)
        const run = async() => {
            try{
                let result = await this.Dynamodb.query(queryParams).promise()
                console.log(result.Items[0].imgs)
                let url: string = null;
                const getRandomNumber = () => {           // 0 ~ img의 길이 -1사이 숫자
                    return Math.floor(Math.random() * (result.Items[0].imgs.length - 0)) + 0
                }
                url = result.Items[0].imgs[getRandomNumber()]
                let test = url.substr(url.length - 14, 14);
                let debugUrl = process.env.domain + 'images/' + test
                success.data = debugUrl
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
    public update(params: any): void {
        throw new Error("Method not implemented.");
    }
    public delete(params: any): void {
        throw new Error("Method not implemented.");
    }
    
}