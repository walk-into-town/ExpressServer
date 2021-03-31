import * as aws from 'aws-sdk'
import * as dotenv from 'dotenv'

export class DBConnection{
    private static DynamoDB: aws.DynamoDB
    public static getDynamoDB(): aws.DynamoDB{
        dotenv.config()
        var params = {
            region: 'ap-northeast-2',
            endpoint: 'http://dynamodb.ap-northeast-2.amazonaws.com'
        }
        aws.config.update(params)
        this.DynamoDB = new aws.DynamoDB()
        return this.DynamoDB
    }
}