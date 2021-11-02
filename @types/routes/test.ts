import * as express from 'express'
var router = express.Router()
import UploadFile from '../modules/FileManager/UploadFile'     //파일 업로드 클래스 import
import isAuthenticated from '../middlewares/authentication'
import {success, fail} from '../static/result'


// let uploader = new UploadFile()
let uploader = new UploadFile()
let upload = uploader.uploadFile('test')        //static 함수로 선언된 uploadFile을 통해 업로드를 위한 multer 객체 획득

router.get('/', function(req: express.Request, res: express.Response, next: Function){
    res.render('index', {title: "Express"})
})

router.get('/auth',isAuthenticated, function(req, res){
    res.send('123')
})

router.get('/suc', function(req, res){
    success.data = 'success'
    res.send(success)
})

router.get('/fail', function(req, res){
    fail.error = 'error',
    fail.errdesc = 'errdesc'
    res.send(fail)
})

module.exports = router 