import * as express from 'express'
import PinpointManager from '../../modules/DBManager/PinpointManager'

var router = express.Router()

router.post('/inquiry', function(req: express.Request, res: express.Response){
    let query = JSON.parse(req.body.json)
    let pinpointDB = new PinpointManager(req, res)
    pinpointDB.readDetail(query)
})

router.post('/delete', function(req: express.Request, res: express.Response){
    let query = JSON.parse(req.body.json)
    query.description = ''
    let pinpointDB = new PinpointManager(req, res)
    pinpointDB.updateDetail(query)
})

router.post('/modify', function(req: express.Request, res: express.Response){
    let query = JSON.parse(req.body.json)
    let pinpointDB = new PinpointManager(req, res)
    pinpointDB.updateDetail(query)
})

module.exports = router