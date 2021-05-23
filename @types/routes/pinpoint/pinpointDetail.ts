/**
 * /pinpoint/detail
 */
import * as express from 'express'
import PinpointManager from '../../modules/DBManager/PinpointManager'
import isAuthenticated from '../../middlewares/authentication'

var router = express.Router()

router.get('/', function(req: express.Request, res: express.Response){
    let query = req.body
    let pinpointDB = new PinpointManager(req, res)
    pinpointDB.readDetail(query)
})

router.delete('/', isAuthenticated, function(req: express.Request, res: express.Response){
    let query = req.body
    query.description = ''
    let pinpointDB = new PinpointManager(req, res)
    pinpointDB.updateDetail(query)
})

router.put('/', isAuthenticated, function(req: express.Request, res: express.Response){
    let query = req.body
    let pinpointDB = new PinpointManager(req, res)
    pinpointDB.updateDetail(query)
})

module.exports = router