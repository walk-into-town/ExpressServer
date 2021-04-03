import * as express from 'express'
var router = express.Router()

const pinpoint = require('./evalPinpoint')
const campaign = require('./evalCampaign')

router.use('/pinpoint', pinpoint)
router.use('./campaign', campaign)


module.exports = router