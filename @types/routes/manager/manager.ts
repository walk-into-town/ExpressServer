/**
 * /manager
 */
import * as express from 'express'
import isAuthenticated from '../../middlewares/authentication'

var router = express.Router()

router.get('/report', function(req: express.Request, res: express.Response){

})

router.put('/report', isAuthenticated, function(req: express.Request, res: express.Response){
    
})

router.put('/report/process', isAuthenticated, function(req: express.Request, res: express.Response){
    
})

module.exports = router