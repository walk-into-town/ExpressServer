import {DBConnection} from './DBConnection'
import * as aws from 'aws-sdk'

export enum ReadType{
    query = 'query',
    scan = 'scan'
}

export abstract class FeatureManager {
    private Dynamodb: aws.DynamoDB
    constructor(){
        this.Dynamodb = DBConnection.getDynamoDB()
    }

    public abstract insert(params: any): void
    public abstract read(params: any, readType: ReadType): void
    public abstract update(params: any): void
    public abstract delete(params: any): void
}