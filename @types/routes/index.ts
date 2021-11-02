import * as express from 'express'
var router = express.Router()

const campaign = require('./campaign/campaign')
const game = require('./game/game')
const member = require('./member/member')
const manager = require('./manager/manager')
const auth = require('./logins/auth')
const loginResult = require('./logins/result')
const debug = require('./debug')
const coupon = require('./coupon/coupon')
const pinpoint = require('./pinpoint/pinpoint')
const monster = require('./monster/monster')
const file = require('./file/file')

router.use('/campaign', campaign)
router.use('/pinpoint', pinpoint)
router.use('/coupon', coupon)
router.use('/game', game)
router.use('/monster', monster)
router.use('/member', member)
router.use('/manager', manager)
router.use('/auth', auth)
router.use('/login/result', loginResult)
router.use('/debug', debug)
router.use('/file', file)

module.exports = router