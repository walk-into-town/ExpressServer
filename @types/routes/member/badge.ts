/**
 * /member/badge
 */
import * as express from 'express'
import isAuthenticated from '../../middlewares/authentication'

var router = express.Router()

router.get('/', function(req: express.Request, res: express.Response){

})

router.get('/representbadge', function(req: express.Request, res: express.Response){
    
})

router.put('/representbadge', isAuthenticated, function(req: express.Request, res: express.Response){
    
})

module.exports = router