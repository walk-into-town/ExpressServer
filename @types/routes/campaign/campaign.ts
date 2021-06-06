/**
 * campaign 라우팅 테이블
 * /campaign
 * pinpoint, register, inquiry, participate, evaluate, coupon
 */


import * as express from 'express'
import UploadFile from '../../modules/FileManager/UploadFile'
import CampaignManager from '../../modules/DBManager/CampaignManager'
import CouponManager from '../../modules/DBManager/tempCoupon'
import PinpointManager from '../../modules/DBManager/tempPinpoint'
import * as dotenv from 'dotenv'
import isAuthenticated from '../../middlewares/authentication'
import { toRead } from '../../modules/DBManager/FeatureManager'
import { error, fail } from '../../static/result'


var router = express.Router()
dotenv.config()

const review = require('./campaignReview')
const uploader = new UploadFile()
const upload = uploader.testupload()

router.use('/review', review)

//캠페인 등록
router.post('/', isAuthenticated, function(req: express.Request, res: express.Response){
    res.locals.coupons = [];
    let query = req.body
    query.pcoupons = []
    console.log(`캠페인 등록\n요청 JSON\n${JSON.stringify(query, null, 2)}`)
    let coupons = req.body.coupons
    let couponDB = new CouponManager(req, res)
    let pinpoints = req.body.pinpoints
    res.locals.pinpoints = []

    if(pinpoints == undefined){
        fail.error = error.invalKey
        fail.errdesc = '핀포인트 없음'
        res.status(400).send(fail)
        return;
    }

    // if(coupons == undefined){
    //     let result = {
    //         result: 'failed',
    //         error: 'Missing Requried Value: Coupon'
    //     }
    //     res.status(400).send(result)
    //     return;
    // }

    // if(coupons != undefined){
    //     for (const coupon of coupons) {
    //         console.log(coupon)
    //         console.log(`\n\n`)
    //         couponDB.insert(coupon)
    //     }
    //     for (const coupon of res.locals.coupons){
    //         if(coupon.id == -1){
    //             query.coupons = coupon
    //         }
    //         else{
    //             query.pcoupons.push(coupon)
    //             pinpoints[coupon.paymentCondition].coupon = coupon.id
    //         }
    //     }
    // }
    let pinpointDB = new PinpointManager(req, res)
    const run = async() => {
        res.locals.pids = []
        res.locals.cids = []
        res.locals.campid = ''
        let campCoupon;
        try{
            console.log(`쿠폰 등록중...`)
            for(let i = 0; i < coupons.length; i++){
                console.log(`${i}번째 쿠폰 등록`)
                await couponDB.insert(coupons[i])()
            }
            for(let i = 0; i < res.locals.coupons.length; i++){
                if(res.locals.coupons[i].paymentCondition == -1){
                    campCoupon = res.locals.coupons[i].id
                }
                else{
                    query.pcoupons.push(res.locals.coupons[i].id)
                    pinpoints[res.locals.coupons[i].paymentCondition].coupons = [res.locals.coupons[i].id]
                }
            }
            query.coupons = campCoupon
            console.log(`핀포인트 등록중...`)
            for(let i = 0; i < pinpoints.length; i++){
                console.log(`${i}번째 핀포인트 등록`)
                await pinpointDB.insert(pinpoints[i])()
            }
            query.pinpoints = res.locals.pinpoints
            console.log('캠페인 등록중...')
            let campaignDB = new CampaignManager(req, res)
            campaignDB.insert(query)
        }
        catch(err){
            var aws = require('aws-sdk')
            aws.config.update({
            accessKeyId: process.env.aws_access_key_id,
            secretAccessKey: process.env.aws_secret_access_key,
                region: 'us-east-1',
                endpoint: 'http://localhost:8000'
            })
            let doclient = new aws.DynamoDB.DocumentClient()
            for (const id of res.locals.cids) {
                let deleteParams = {
                    TableName: 'Coupon',
                    Key:{
                        'id': id
                    }
                }
                await doclient.delete(deleteParams).promise()
            }
            for (const id of res.locals.pids) {
                let deleteParams = {
                    TableName: 'Pinpoint',
                    Key:{
                        'id': id
                    }
                }
                await doclient.delete(deleteParams).promise()
            }
            let campParam = {
                TableName: 'Campaign',
                Key: {
                    'id': res.locals.campid
                }
            }
            await doclient.delete(campParam)
            fail.error = error.invalReq
            fail.errdesc = err
            res.status(400).send(fail)
        }
    }
    run()
})

//캠페인 조회
router.get('/', function(req: express.Request, res: express.Response){
    let query = req.query
    let campaignDB = new CampaignManager(req, res)
    if(query.value == ''){
        res.redirect('campaign/scan')
        return;
    }
    console.log(`요청 JSON\n${JSON.stringify(query, null, 2)}`)
    let type = toRead.id
    if(query.type == 'id' && query.condition == 'exact'){
        type = toRead.id
    }
    else if(query.type == 'pinpoint' && query.condition == 'exact'){
        campaignDB.readByPinpoint(query)
        return;
    }
    else if((query.type == 'id' || query.type == 'pinpoint') && query.condition != 'exact'){
        fail.error = error.invalReq
        fail.errdesc = 'id / pinpoint 조회는 exact만 가능합니다.'
        res.status(400).send(fail)
        return;
    }
    else if(query.type == 'name') {
        type = toRead.name
    }
    else if(query.type == 'ownner'){
        type = toRead.ownner
    }
    else if(query.type == 'region'){
        type = toRead.region
    }
    else{
        fail.error = error.invalReq
        fail.errdesc = 'type은 name | ownner | region | id 중 하나여야 합니다.'
        res.status(400).send(fail)
        console.log(`조회 실패. 응답 JSON\n${JSON.stringify(fail,null, 2)}`)
        return;
    }
    
    if(query.condition == 'exact'){
        console.log('일치 조회 시작')
        campaignDB.read(query.value, type)
    }
    else if(query.condition == 'part'){
        console.log('부분 일치 조회 시작')
        campaignDB.readPart(query.value, type)
    }
    else{
        fail.errdesc = error.invalReq
        fail.errdesc = 'condition은 exact | part 중 하나여야 합니다.'
        res.status(400).send(fail)
        console.log(`조회 실패. 응답 JSON\n${JSON.stringify(fail,null, 2)}`)
        return;
    }
})

router.get('/scan', function(req: express.Request, res: express.Response){
    let campaignDB = new CampaignManager(req, res)
    campaignDB.scan()
})

//캠페인 수정
router.put('/',isAuthenticated, upload.array('imgs'), function(req: express.Request, res: express.Response){
    let query = req.body
    let campaignDB = new CampaignManager(req,res)
    let imgs: Array<string> = []
    if(req.files != undefined){
        for(let i = 0; i < req.files.length; i++){
            imgs.push(process.env.domain + req.files[i].filename)
        }
    }
    query.imgs = imgs
    campaignDB.update(query)
})

//플레이중 유저 조회
router.get('/playing', isAuthenticated, function(req: express.Request, res: express.Response){
    let campaignDB = new CampaignManager(req, res)
    let query = req.query
    campaignDB.readPlaying(query)
})

router.get('/recommend', isAuthenticated, function(req: express.Request, res: express.Response){
    let campaignDB = new CampaignManager(req, res)
    let query = req.query
    campaignDB.readRecommend(query)
})

module.exports = router