import * as express from 'express'
import {MemberManager} from '../../modules/DBManager/MemberManager'
import {SessionManager} from '../../modules/DBManager/SessionManager'

var router = express.Router()

const badge = require('./badge')

router.use('/badge', badge)

router.post('/register', function(req: express.Request, res: express.Response){
    let sessCheck = new SessionManager(req, res)
    if(sessCheck.isSessionValid() == true){
        let result = {
            result: 'error',
            error: 'already logged in'
        }
        res.status(400).send(result)
        return;
    }
    let memberDB = new MemberManager(req, res)
    let query = JSON.parse(req.body.json)
    memberDB.insert(query)
})

router.post('/login', function(req: express.Request, res: express.Response){ 
    let sessCheck = new SessionManager(req, res)
    if(sessCheck.isSessionValid() == true){
        let result = {
            result: 'error',
            error: 'already logged in'
        }
        res.status(400).send(result)
        return;
    }
    let memberDB = new MemberManager(req, res)
    let query = JSON.parse(req.body.json)
    memberDB.login(query)
})

router.post('/modify', function(req: express.Request, res: express.Response){
    
})

router.post('/withdraw', function(req: express.Request, res: express.Response){
    
})

router.post('/coupon/inquiry', function(req: express.Request, res: express.Response){
    
})

router.post('/coupon/use', function(req: express.Request, res: express.Response){
    
})

module.exports = router