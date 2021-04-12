import * as aws from 'aws-sdk'

export class DBConnection{
    private static DynamoDB: aws.DynamoDB.DocumentClient
    public static getDynamoDB(): aws.DynamoDB.DocumentClient{
        const dotenv = require('dotenv')
        dotenv.config()
        var params = {
            accessKeyId: process.env.aws_access_key_id,
            secretAccessKey: process.env.aws_secret_access_key,
            region: 'us-east-1',
            endpoint: 'http://localhost:8000'
        }
        aws.config.update(params)
        this.DynamoDB = new aws.DynamoDB.DocumentClient()
        return this.DynamoDB
    }
}