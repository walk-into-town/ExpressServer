import * as express from 'express'
var router = express.Router()

const badge = require('./badge')

router.use('/badge', badge)

router.post('/register', function(req: express.Request, res: express.Response){

})

router.post('/modify', function(req: express.Request, res: express.Response){
    
})

router.post('/withdraw', function(req: express.Request, res: express.Response){
    
})

router.post('/coupon/inquiry', function(req: express.Request, res: express.Response){
    
})

router.post('/coupon/use', function(req: express.Request, res: express.Response){
    
})

module.exports = router