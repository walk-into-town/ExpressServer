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


var router = express.Router()
dotenv.config()

const pinpoint = require('./pinpoint')
const participate = require('./campaignParticipate')
const evaluate = require('./campaignEvaluate')
const coupon = require('./campaignCoupon')
const uploader = new UploadFile()
const upload = uploader.testupload()



router.use('/pinpoint', pinpoint)
router.use('/participate', participate)
router.use('/evaluate', evaluate)
router.use('/coupon', coupon)


//캠페인 등록
router.post('/',isAuthenticated, upload.array('img'), function(req: express.Request, res: express.Response){
    res.locals.coupons = [];
    let query = req.body
    query.pcoupons = []
    let coupons = JSON.parse(req.body.coupons)
    let couponDB = new CouponManager(req, res)
    let pinpoints = JSON.parse(req.body.pinpoints)
    res.locals.pinpoints = []

    if(pinpoints == undefined){
        let result = {
            result: 'failed',
            error: 'Missing Required Values: pinpoint'
        }
        res.status(400).send(result)
        return;
    }

    if(coupons == undefined){
        let result = {
            result: 'failed',
            error: 'Missing Requried Value: Coupon'
        }
        res.status(400).send(result)
        return;
    }

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
        for(let i = 0; i < coupons.length; i++){
            console.log(coupons[i])
            await couponDB.insert(coupons[i])()
        }
        console.log(res.locals.coupons)
        for(let i = 0; i < res.locals.coupons.length; i++){
            if(res.locals.coupons[i].paymentCondition == -1){
                query.coupons = res.locals.coupons[i].id
            }
            else{
                query.pcoupons.push(res.locals.coupons[i].id)
                pinpoints[res.locals.coupons[i].paymentCondition].coupon = coupons[i].id
            }
        }

        for(let i = 0; i < pinpoints.length; i++){
            await pinpointDB.insert(pinpoints[i])()
        }
        query.pinpoints = res.locals.pinpoints
        let campaignDB = new CampaignManager(req, res)
        campaignDB.insert(query)
    }
    run()
})

//캠페인 조회
router.get('/', function(req: express.Request, res: express.Response){
    let query = req.body
    let campaignDB = new CampaignManager(req, res)
    campaignDB.read(query.value, query.type)
})

//캠페인 수정
router.put('/',isAuthenticated, upload.array('img'), function(req: express.Request, res: express.Response){
    let query = JSON.parse(req.body.json)
    let campaignDB = new CampaignManager(req,res)
    campaignDB.update(query)
})

module.exports = router