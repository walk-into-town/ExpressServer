/**
 * campaign 라우팅 테이블
 * pinpoint, register, inquiry, participate, evaluate, coupon
 */


import * as express from 'express'
import UploadFile from '../../modules/FileManager/UploadFile'
import CampaignManager from '../../modules/DBManager/CampaignManager'
import * as dotenv from 'dotenv'

var router = express.Router()
dotenv.config()

const pinpoint = require('./pinpoint')
const participate = require('./campaignParticipate')
const evaluate = require('./campaignEvaluate')
const coupon = require('./campaignCoupon')
const uploader = new UploadFile()
const upload = uploader.testupload()



router.use('/pinpoint', pinpoint)
router.use('participate', participate)
router.use('/evaluate', evaluate)
router.use('/coupon', coupon)


//캠페인 등록
router.post('/register', upload.array('img'), function(req: express.Request, res: express.Response){
    let query = req.body
    let imgs: Array<string> = []
    for(let i = 0; i < req.files.length; i++){
        imgs.push(process.env.domain + req.files[i].filename)
    }
    query.imgs = imgs
    let campaignDB = new CampaignManager(req, res)
    campaignDB.insert(query)
})

//캠페인 조회
router.post('/inquiry', function(req: express.Request, res: express.Response){
    let query = req.body
    let campaignDB = new CampaignManager(req, res)
    campaignDB.read(query.value, query.type)
})

//캠페인 수정
router.post('/modify', upload.array('img'), function(req: express.Request, res: express.Response){
    let query = JSON.parse(req.body.json)
    let campaignDB = new CampaignManager(req,res)
    campaignDB.update(query)
})

module.exports = router