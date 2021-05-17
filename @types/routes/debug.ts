import * as express from 'express'
var router = express.Router()
import Scan from '../modules/Debug/scan'

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

module.exports = router 