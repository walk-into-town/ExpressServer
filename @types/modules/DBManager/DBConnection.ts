import * as aws from 'aws-sdk'

export default class DBConnection{
    private DynamoDB: aws.DynamoDB.DocumentClient
    public getDynamoDB(): aws.DynamoDB.DocumentClient{
        const dotenv = require('dotenv')
        dotenv.config()
        var params = {
            region: process.env.dynamoRegion,
            endpoint: process.env.dynamoEndpoint
        }
        aws.config.update(params)
        this.DynamoDB = new aws.DynamoDB.DocumentClient()
        return this.DynamoDB
    }
}