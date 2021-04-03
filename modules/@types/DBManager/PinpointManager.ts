import { FeatureManager, ReadType } from "./FeatureManager";
import * as express from 'express'
import {Pinpoint} from '../../../models/@js/Pinpoint'
import { DBConnection } from "./DBConnection";
import * as CryptoJS from 'crypto-js'


export class PinpointManager extends FeatureManager{
    private id: string
    public insert(params: any): void {
        let hash = CryptoJS.SHA256(params.name + params.latitude.toString() + params.longitude.toString())  //id 중복 방지 + 이름과 위치가 같은 핀포인트 중복 방지
        params.id = hash.toString(CryptoJS.enc.Base64)
        var dbParams = {
            TableName: 'Pinpoint',
            Item: {
                id: params.id,
                name: params.name,
                imgs: params.imgs,
                latitude: params.latitude,
                longitude: params.longitude,
                updateTime: params.updateTime,
                description: params.description,
                quiz: params.quiz
            },
            ConditionExpression: "attribute_not_exists(id)"      //항목 추가하기 전에 이미 존재하는 항목이 있을 경우 pk가 있을 때 조건 실패. pk는 반드시 있어야 하므로 replace를 방지
        }
        this.id = params.id
        let put = new Promise((r) => this.Dynamodb.put(dbParams, this.onInsert.bind(this)))
    }
    
    private onInsert(err: object, data: any){
        if(err){
            this.res.status(400).send(err)
        }
        else{
            console.log(data)
            let resultstr = {
                "result" : "success",
                "pinpointId": this.id
            }
            console.log(resultstr)
            this.res.status(201).send(JSON.stringify(resultstr))
        }
    }

    public read(params: any, readType: ReadType): void {
        throw new Error("Method not implemented.");
    }
    public update(params: any): void {
        throw new Error("Method not implemented.");
    }
    public delete(params: any): void {
        throw new Error("Method not implemented.");
    }
    
}