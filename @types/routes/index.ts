import * as express from 'express'
var router = express.Router()

const testroute = require('./test')
const campaign = require('./campaign/campaign')
const game = require('./game/game')
const member = require('./member/member')
const manager = require('./manager/manager')
const auth = require('./logins/auth')
const loginResult = require('./logins/result')
const debug = require('./debug')


router.use('/test', testroute)
router.use('/campaign', campaign)
router.use('/game', game)
router.use('/member', member)
router.use('/manager', manager)
router.use('/auth', auth)
router.use('/login/result', loginResult)
router.use('/debug', debug)

module.exports = router