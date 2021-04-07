import * as express from 'express'
var router = express.Router()

router.post('/campaign', function(req: express.Request, res: express.Response){

})

router.post('/quiz', function(req: express.Request, res: express.Response){
    
})

router.post('/inquiry/campaign', function(req: express.Request, res: express.Response){
    res.send('testest')
})

router.post('/inquiry/user', function(req: express.Request, res: express.Response){
    
})

module.exports = router