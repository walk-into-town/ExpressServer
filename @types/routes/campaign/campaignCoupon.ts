/**
 * /campaign/coupon
 */
import * as express from 'express'
import CouponManager from '../../modules/DBManager/CouponManager'
import uploader from '../../modules/FileManager/UploadFile'
import * as dotenv from 'dotenv'
import isAuthenticated from '../../middlewares/authentication'

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
    let query = req.body
    couponDB.read(query)
})

router.delete('/', isAuthenticated, function(req: express.Request, res: express.Response){
    
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