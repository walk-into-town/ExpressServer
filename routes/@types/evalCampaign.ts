import * as express from 'express'
var router = express.Router()

const rate = require('./campaignRate')

router.use('/rate', rate)

module.exports = router