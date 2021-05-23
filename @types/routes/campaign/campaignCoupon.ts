/**
 * /campaign/coupon
 */
import * as express from 'express'
import CouponManager from '../../modules/DBManager/CouponManager'
import uploader from '../../modules/FileManager/UploadFile'
import * as dotenv from 'dotenv'
import isAuthenticated from '../../middlewares/authentication'
import { error, fail } from '../../static/result'

let fileMan = new uploader();
let upload = fileMan.testupload()

var router = express.Router()
dotenv.config()

router.post('/', isAuthenticated, upload.array('img'), function(req: express.Request, res: express.Response){
    let couponDB = new CouponManager(req, res)
    let query = JSON.parse(req.body.json)
    let imgs: Array<string> = []
    for(let i = 0; i < req.files.length; i++){
        imgs.push(process.env.domain + req.files[i].filename)
    }
    query.img = imgs
    couponDB.insert(query)
})

router.get('/', function(req: express.Request, res: express.Response){
    let couponDB = new CouponManager(req, res)
    let query = req.query
    if(query.type == 'single'){
        couponDB.read(query)
        return;
    }
    if(query.type == 'campaign'){
        couponDB.readList(query)
        return;
    }
    if(query.type == 'pinpoint'){
        couponDB.readList(query)
        return;
    }
    fail.error = error.invalReq
    fail.errdesc = 'type은 single | campaign | pinpoint 중 하나여야합니다.'
    res.status(400).send(fail)
})

router.delete('/', isAuthenticated, function(req: express.Request, res: express.Response){
    let couponDB = new CouponManager(req, res)
    let query = req.body
    console.log(query)
    couponDB.delete(query)
})


router.put('/', isAuthenticated, upload.array('img'), function(req: express.Request, res: express.Response){
    let couponDB = new CouponManager(req, res)
    let query = JSON.parse(req.body.json)
    let imgs: Array<string> = []
    for(let i = 0; i < req.files.length; i++){
        imgs.push(process.env.domain + req.files[i].filename)
    }
    query.imgs = imgs
    couponDB.update(query)
})


module.exports = router