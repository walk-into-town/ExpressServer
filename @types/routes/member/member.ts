/**
 * /member
 */
import * as express from 'express'
import passport from 'passport'
import MemberManager from '../../modules/DBManager/MemberManager'
import isAuthenticated from '../../middlewares/authentication'

var router = express.Router()

const badge = require('./badge')

router.use('/badge', badge)

//회원가입
router.put('/', function(req: express.Request, res: express.Response){
    let memberDB = new MemberManager(req, res)
    let query = req.body
    memberDB.insert(query)
})

//ID 중복 확인
router.get('/checkid', function(req: express.Request, res: express.Response){
    let memberDB = new MemberManager(req, res)
    let query = req.body
    memberDB.check('id', query)
})

//닉네임 중복 확인
router.get('/checknickname', function(req: express.Request, res: express.Response){
    let memberDB = new MemberManager(req, res)
    let query = req.body
    memberDB.check('nickname', query)
})

router.post('/login', passport.authenticate('local', {
  successRedirect: '/login/result/success',
  failureRedirect: '/login/result/fail',
  failureFlash: true
}))


//로그아웃
router.delete('/logout', isAuthenticated, function(req: express.Request, res: express.Response){
    let memberDB = new MemberManager(req, res)
    let query = req.body
    memberDB.logout(query)
})

//회원정보 수정
router.put('/', isAuthenticated, function(req: express.Request, res: express.Response){
    
})

//회원탈퇴
router.delete('/', isAuthenticated, function(req: express.Request, res: express.Response){
    
})

router.get('/coupon', isAuthenticated, function(req: express.Request, res: express.Response){
    
})

router.put('/coupon', isAuthenticated, function(req: express.Request, res: express.Response){
    
})

module.exports = router