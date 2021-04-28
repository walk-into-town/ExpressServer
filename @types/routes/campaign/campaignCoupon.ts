import * as express from 'express'
import CouponManager from '../../modules/DBManager/CouponManager'
import uploader from '../../modules/FileManager/UploadFile'

let fileMan = new uploader();
let upload = fileMan.testupload()

var router = express.Router()


router.post('/register', upload.array('img'), function(req: express.Request, res: express.Response){
    let couponDB = new CouponManager(req, res)
    let query = JSON.parse(req.body.json)
    let imgs: Array<string> = []
    for(let i = 0; i < req.files.length; i++){
        imgs.push("https://walk-into-town.ga/" + req.files[i].filename)
    }
    query.img = imgs
    couponDB.insert(query)
})

router.post('/inquiry', function(req: express.Request, res: express.Response){
    let couponDB = new CouponManager(req, res)
    let query = req.body
    couponDB.read(query)
})

router.post('/delete', function(req: express.Request, res: express.Response){
    
})


router.post('/modify', upload.array('img'), function(req: express.Request, res: express.Response){
    let couponDB = new CouponManager(req, res)
    let query = JSON.parse(req.body.json)
    let imgs: Array<string> = []
    for(let i = 0; i < req.files.length; i++){
        imgs.push("https://walk-into-town.ga/" + req.files[i].filename)
    }
    query.imgs = imgs
    couponDB.update(query)
})


module.exports = router