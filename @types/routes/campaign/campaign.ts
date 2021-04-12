/**
 * campaign 라우팅 테이블
 * pinpoint, register, inquiry, participate, evaluate, coupon
 */


import * as express from 'express'
import {UploadFile} from '../../modules/FileManager/UploadFile'
import {CampaignManager} from '../../modules/DBManager/CampaignManager'
import {SessionManager} from '../../modules/DBManager/SessionManager'

var router = express.Router()

const pinpoint = require('./pinpoint')
const participate = require('./campaignParticipate')
const evaluate = require('./campaignEvaluate')
const coupon = require('./campaignCoupon')
const uploader = new UploadFile()
const upload = uploader.testupload()



router.use('/pinpoint', pinpoint)
router.use('participate', participate)
router.use('/evaluate', evaluate)
router.use('coupon', coupon)


router.post('/register', upload.array('img'), function(req: express.Request, res: express.Response){
    let sessCheck = new SessionManager(req, res)
    if(sessCheck.isSessionValid() == false){
        let result = {
            result: 'error',
            error: 'session expired'
        }
        res.status(400).send(result)
        return;
    }
    let query = JSON.parse(req.body.json)
    let imgs: Array<string> = []
    for(let i = 0; i < req.files.length; i++){
        imgs.push("https://walk-into-town.ga/" + req.files[i].filename)
    }
    query.imgs = imgs
    let campaignDB = new CampaignManager(req, res)
    campaignDB.insert(query)
})

router.post('/inquiry', function(req: express.Request, res: express.Response){
    let sessCheck = new SessionManager(req, res)
    if(sessCheck.isSessionValid() == false){
        let result = {
            result: 'error',
            error: 'session expired'
        }
        res.status(400).send(result)
        return;
    }
    let query = JSON.parse(req.body.json)
    let campaignDB = new CampaignManager(req, res)
    campaignDB.read(query.value, query.type)
})

router.post('/modify', upload.array('img'), function(req: express.Request, res: express.Response){
    let sessCheck = new SessionManager(req, res)
    if(sessCheck.isSessionValid() == false){
        let result = {
            result: 'error',
            error: 'session expired'
        }
        res.status(400).send(result)
        return;
    }
    
})

module.exports = router