/**
 * /campaign/participate
 */
import * as express from 'express'
import isAuthenticated from '../../middlewares/authentication'
import CampaignManager from '../../modules/DBManager/CampaignManager'

var router = express.Router()

router.put('/campaign', isAuthenticated, function(req: express.Request, res: express.Response){
    let query = req.body
    let campaignDB = new CampaignManager(req, res)
    campaignDB.participate(query)
})

router.post('/quiz', isAuthenticated, function(req: express.Request, res: express.Response){
    
})

router.get('/campaign', function(req: express.Request, res: express.Response){
    
})

router.get('/user', function(req: express.Request, res: express.Response){
    
})

module.exports = router