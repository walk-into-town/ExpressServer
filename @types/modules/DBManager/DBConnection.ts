import * as aws from 'aws-sdk'
import * as dotenv from 'dotenv'

export class DBConnection{
    private static DynamoDB: aws.DynamoDB.DocumentClient
    public static getDynamoDB(): aws.DynamoDB.DocumentClient{
        dotenv.config()
        var params = {
            region: 'us-east-1',
            endpoint: 'http://localhost:8000'
        }
        aws.config.update(params)
        this.DynamoDB = new aws.DynamoDB.DocumentClient()
        return this.DynamoDB
    }
}