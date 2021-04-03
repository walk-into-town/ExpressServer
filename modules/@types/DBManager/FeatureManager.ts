import {DBConnection} from './DBConnection'
import * as aws from 'aws-sdk'
import * as express from 'express'

export enum ReadType{
    query = 'query',
    scan = 'scan'
}

export abstract class FeatureManager {
    protected Dynamodb: aws.DynamoDB.DocumentClient
    protected req: express.Request
    protected res: express.Response
    constructor(req: express.Request, res: express.Response){
        this.Dynamodb = DBConnection.getDynamoDB()
        this.req = req
        this.res = res
    }

    public abstract insert(params: any): void
    public abstract read(params: any, readType: ReadType): void
    public abstract update(params: any): void
    public abstract delete(params: any): void
}