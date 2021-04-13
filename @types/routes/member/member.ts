import * as express from 'express'
import {MemberManager} from '../../modules/DBManager/MemberManager'
import {SessionManager} from '../../modules/DBManager/SessionManager'

var router = express.Router()

const badge = require('./badge')

router.use('/badge', badge)

//회원가입
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

//로그인
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

//로그아웃
router.post('/logout', function(req: express.Request, res: express.Response){
    let sessCheck = new SessionManager(req, res)
    if(sessCheck.isSessionValid() == false){
        let result = {
            result: 'error',
            error: 'User Not Logged In'
        }
        res.status(400).send(result)
        return;
    }
    let memberDB = new MemberManager(req, res)
    let query = JSON.parse(req.body.json)
    memberDB.logout(query)
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