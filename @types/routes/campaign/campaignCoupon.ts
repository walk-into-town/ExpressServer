import * as express from 'express'
import CouponManager from '../../modules/DBManager/CouponManager'
import uploader from '../../modules/FileManager/UploadFile'

let fileMan = new uploader();
let upload = fileMan.testupload()

var router = express.Router()


router.post('/register', upload.single('img'), function(req: express.Request, res: express.Response){
    let couponDB = new CouponManager(req, res)
    let params = JSON.parse(req.body.json)
    if(req.file != undefined){
        params.img = `https://walk-into-town.ga/${req.file.filename}`
    }
    couponDB.insert(params)
})

router.post('/inquiry', function(req: express.Request, res: express.Response){
    let couponDB = new CouponManager(req, res)
    let params = JSON.parse(req.body.json)
    couponDB.read(params)
})

router.post('/delete', function(req: express.Request, res: express.Response){
    
})

router.post('/modify', function(req: express.Request, res: express.Response){
    
})


module.exports = router