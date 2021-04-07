/**
 * campaign 라우팅 테이블
 * pinpoint, register, inquiry, participate, evaluate, coupon
 */


import * as express from 'express'
var router = express.Router()

const pinpoint = require('./pinpoint')
const participate = require('./campaignParticipate')
const evaluate = require('./campaignEvaluate')
const coupon = require('./campaignCoupon')




router.use('/pinpoint', pinpoint)
router.use('participate', participate)
router.use('/evaluate', evaluate)
router.use('coupon', coupon)


router.post('/register', function(req: express.Request, res: express.Response){
    res.send('test')
})

router.post('/modify', function(req: express.Request, res: express.Response){
    
})

module.exports = router