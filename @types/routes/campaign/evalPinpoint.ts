import * as express from 'express'
var router = express.Router()

const comment = require('./pinpointComment')

router.use('/comment', comment)

module.exports = router