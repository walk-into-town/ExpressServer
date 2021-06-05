import * as express from 'express'
var router = express.Router()
import Scan from '../modules/Debug/scan'
import UploadFile from '../modules/FileManager/UploadFile'     //파일 업로드 클래스 import
import isAuthenticated from '../middlewares/authentication'
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

router.get('/session', upload.array('img'), function(req: express.Request, res: express.Response){
    res.status(200).send(req.session)
})

module.exports = router 