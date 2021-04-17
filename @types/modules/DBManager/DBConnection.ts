import * as aws from 'aws-sdk'

export default class DBConnection{
    private DynamoDB: aws.DynamoDB.DocumentClient
    public getDynamoDB(): aws.DynamoDB.DocumentClient{
        const dotenv = require('dotenv')
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