/**
 * /member
 */
import * as express from 'express'
import passport from 'passport'
import MemberManager from '../../modules/DBManager/MemberManager'
import isAuthenticated from '../../middlewares/authentication'
import UploadFile from '../../modules/FileManager/UploadFile'

var router = express.Router()

const badge = require('./badge')
const uploader = new UploadFile()
const upload = uploader.testupload()

router.use('/badge', badge)

//회원가입
router.post('/', function(req: express.Request, res: express.Response){
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

router.get('/playing', isAuthenticated, function(req: express.Request, res: express.Response){
    let query = req.query
    let memberDB = new MemberManager(req, res)
    memberDB.readPlaying(query)
})

router.get('/my', isAuthenticated, function(req: express.Request, res: express.Response){
    let query = req.query
    let memberDB = new MemberManager(req, res)
    memberDB.readMyCamp(query)
})

//로그아웃
router.delete('/logout', isAuthenticated, function(req: express.Request, res: express.Response){
    let memberDB = new MemberManager(req, res)
    let query = req.body
    console.log(query)
    memberDB.logout(query)
})

//회원정보 수정
router.put('/', isAuthenticated, upload.array('img'), function(req: express.Request, res: express.Response){
    let memberDB = new MemberManager(req, res)
    let query = req.body
    let imgs: Array<string> = []
    if(req.files != undefined){
        for(let i = 0; i < req.files.length; i++){
            imgs.push(process.env.domain + req.files[i].filename)
        }
    }
    if(imgs.length == 0){
        query.imgs = ''
    }
    else{
        query.imgs = imgs[0]
    }
    memberDB.update(query)
})

//회원정보 조회
router.get('/', isAuthenticated, function(req: express.Request, res: express.Response){
    let memberDB = new MemberManager(req, res)
    memberDB.read('')
})

//회원탈퇴
router.delete('/', isAuthenticated, function(req: express.Request, res: express.Response){
    
})

router.get('/coupon', isAuthenticated, function(req: express.Request, res: express.Response){
    
})

router.put('/coupon', isAuthenticated, function(req: express.Request, res: express.Response){
    
})

module.exports = router