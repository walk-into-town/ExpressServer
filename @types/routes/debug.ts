import * as express from 'express'
var router = express.Router()
import Scan from '../modules/Debug/scan'
import UploadFile from '../modules/FileManager/UploadFile'     //파일 업로드 클래스 import
import { error, fail, success } from '../static/result'
let uploader = new UploadFile()
let upload = uploader.testupload()

router.post('/file', upload.array('img'), function(req: express.Request, res: express.Response){
    let imgs: Array<string> = []
    for(let i = 0; i < req.files.length; i++){
        imgs.push(process.env.domain + req.files[i].filename)
    }
    res.status(200).send(imgs)
})

router.get('/', function(req: express.Request, res: express.Response, next: Function){
    res.render('index', {title: "Express"})
})

router.get('/scan/campaign', function(req: Express.Request, res: Express.Response){
    let scanner = new Scan(req, res)
    scanner.campaign()
})

router.get('/scan/pinpoint', function(req: Express.Request, res: Express.Response){
    let scanner = new Scan(req, res)
    scanner.pinpoint()
})

router.get('/scan/coupon', function(req: Express.Request, res: Express.Response){
    let scanner = new Scan(req, res)
    scanner.coupon()
})

router.get('/scan/Member', function(req: Express.Request, res: Express.Response){
    let scanner = new Scan(req, res)
    scanner.member()
})

router.get('/scan/Monster', function(req: Express.Request, res: Express.Response){
    let scanner = new Scan(req, res)
    scanner.monster()
})

router.get('/scan/Ranking', function(req: Express.Request, res: Express.Response){
    let scanner = new Scan(req, res)
    scanner.ranking()
})

router.get('/scan/Report', function(req: Express.Request, res: Express.Response){
    let scanner = new Scan(req, res)
    scanner.report()
})

router.get('/scan/prison', function(req: Express.Request, res: Express.Response){
    let scanner = new Scan(req, res)
    scanner.prison()
})

router.get('/scan/block',function(req: Express.Request, res: Express.Response){
    let scanner = new Scan(req, res)
    scanner.block()
})

router.get('/session', upload.array('img'), function(req: express.Request, res: express.Response){
    res.status(200).send(req.session)
})

router.post('/fix', function(req: express.Request, res: express.Response){
    let query = req.body
    let type = query.type
    let id = query.caid
    let time = query.time
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

    let updateParam = {
    TableName: type,
    Key: {id: id},
    UpdateExpression: 'set updateTime = :data',
    ExpressionAttributeValues: {':data': time}
    }

    const run = async () => {
        try{  
            await doclient.update(updateParam).promise()
            success.data = '성공'
            res.status(201).send(success)
        }
        catch(err){
            fail.error = error.dbError
            fail.errdesc = err
            res.status(521).send(fail)
        }
    }
    run()
})

module.exports = router 