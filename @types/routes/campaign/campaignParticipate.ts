/**
 * /campaign/participate
 */
import * as express from 'express'
import isAuthenticated from '../../middlewares/authentication'

var router = express.Router()

router.post('/campaign', isAuthenticated, function(req: express.Request, res: express.Response){

})

router.post('/quiz', isAuthenticated, function(req: express.Request, res: express.Response){
    
})

router.get('/campaign', function(req: express.Request, res: express.Response){
    
})

router.get('/user', function(req: express.Request, res: express.Response){
    
})

module.exports = router