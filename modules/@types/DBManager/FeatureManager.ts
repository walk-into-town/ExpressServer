import {DBConnection} from './DBConnection'
import * as aws from 'aws-sdk'
import * as express from 'express'

export enum ReadType{
    query = 'query',
    scan = 'scan'
}

export abstract class FeatureManager {
    private Dynamodb: aws.DynamoDB
    private req: express.Request
    constructor(req: express.Request){
        this.Dynamodb = DBConnection.getDynamoDB()
        this.req = req
    }

    public abstract insert(params: any): void
    public abstract read(params: any, readType: ReadType): void
    public abstract update(params: any): void
    public abstract delete(params: any): void
}