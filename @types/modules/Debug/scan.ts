import { success } from "../../static/result"

var aws = require('aws-sdk')
var dotenv = require('dotenv')
dotenv.config()
aws.config.update({
  accessKeyId: process.env.aws_access_key_id,
  secretAccessKey: process.env.aws_secret_access_key,
    region: 'us-east-1',
    endpoint: 'http://localhost:8000'
})
let doclient = new aws.DynamoDB.DocumentClient()

export default class Scan{
    req;
    res;
    constructor(req, res){
        this.req = req
        this.res = res
    }
    
    public campaign(){
        const run = async() => {
            let result = await doclient.scan({TableName: "Campaign"}).promise()
            console.log(result.Items)
            success.data = result.Items
            this.res.status(200).send(success)
        }
        run()
    }  

    public pinpoint(){
        const run = async() => {
            let result = await doclient.scan({TableName: "Pinpoint"}).promise()
            console.log(result.Items)
            success.data = result.Items
            this.res.status(200).send(success)
        }
        run()
    }

    public coupon(){
        const run = async() => {
            let result = await doclient.scan({TableName: "Coupon"}).promise()
            console.log(result.Items)
            success.data = result.Items
            this.res.status(200).send(success)
        }
        run()
    }

    public member(){
        const run = async() => {
            let result = await doclient.scan({TableName: "Member"}).promise()
            console.log(result.Items)
            success.data = result.Items
            this.res.status(200).send(success)
        }
        run()
    }

    public monster(){
        const run = async() => {
            let result = await doclient.scan({TableName: "Monster"}).promise()
            console.log(result.Items)
            success.data = result.Items
            this.res.status(200).send(success)
        }
        run()
    }

    public ranking(){
        const run = async() => {
            let result = await doclient.scan({TableName: "Ranking"}).promise()
            console.log(result.Items)
            success.data = result.Items
            this.res.status(200).send(success)
        }
        run()
    }

    public report() {
        const run = async() => {
            let result = await doclient.scan({TableName: 'Report'}).promise()
            console.log(result.Items)
            success.data = result.Items
            this.res.status(200).send(success)
        }
        run()
    }
}