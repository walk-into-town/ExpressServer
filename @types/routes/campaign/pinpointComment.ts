/**
 * /campaign/evaluate/pinpoint/comment
 */
import * as express from 'express'
import isAuthenticated from '../../middlewares/authentication'

var router = express.Router()


router.post('/', isAuthenticated, function(req: express.Request, res: express.Response){

})

router.get('/', function(req: express.Request, res: express.Response){
    
})

router.delete('/', isAuthenticated, function(req: express.Request, res: express.Response){
    
})

router.put('/', isAuthenticated, function(req: express.Request, res: express.Response){
    
})

router.put('/rate', isAuthenticated, function(req: express.Request, res: express.Response){

})

module.exports = router