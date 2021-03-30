var express = require('express')
var router = express.Router()
import {UploadFile} from '../../modules/@js/FileManager/UploadFile'     //파일 업로드 클래스 import


// let uploader = new UploadFile()
let upload = UploadFile.uploadFile()        //static 함수로 선언된 uploadFile을 통해 업로드를 위한 multer 객체 획득

let test = UploadFile.test()

router.get('/', function(req, res, next){
    res.render('index', {title: "Express"})
})

router.post('/upload', upload.single('imgs') ,function(req, res){      ///upload로 요청이 왔을 때, key가 imgs인 것만 업로드
    res.status(200).send('success')
})

router.post('/test', test.single('imgs'), function(req, res){
    res.status(200).send('success')
})

module.exports = router