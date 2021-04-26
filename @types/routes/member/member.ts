import * as express from 'express'
import MemberManager from '../../modules/DBManager/MemberManager'
import SessionManager from '../../modules/DBManager/SessionManager'

var router = express.Router()

const badge = require('./badge')

router.use('/badge', badge)

//회원가입
router.post('/register', function(req: express.Request, res: express.Response){
    let memberDB = new MemberManager(req, res)
    let query = req.body
    memberDB.insert(query)
})

//ID 중복 확인
router.post('/checkid', function(req: express.Request, res: express.Response){
    let memberDB = new MemberManager(req, res)
    let query = req.body
    memberDB.check('id', query)
})

//닉네임 중복 확인
router.post('/checknickname', function(req: express.Request, res: express.Response){
    let memberDB = new MemberManager(req, res)
    let query = req.body
    memberDB.check('nickname', query)
})

//로그인
router.post('/login', function(req: express.Request, res: express.Response){ 
    console.log(req.body)
    let memberDB = new MemberManager(req, res)
    let query = req.body
    memberDB.login(query)
})

//로그아웃
router.post('/logout', function(req: express.Request, res: express.Response){
    let memberDB = new MemberManager(req, res)
    let query = req.body
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