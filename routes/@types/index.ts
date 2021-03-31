import * as express from 'express'
var router = express.Router()
import {UploadFile} from '../../modules/@js/FileManager/UploadFile'     //파일 업로드 클래스 import
import {DistributionController} from '../../modules/@js/DistributionManager/DistributionController'


// let uploader = new UploadFile()
let upload = UploadFile.uploadFile()        //static 함수로 선언된 uploadFile을 통해 업로드를 위한 multer 객체 획득

let test = UploadFile.test()

router.get('/', function(req: express.Request, res: express.Response, next: Function){
    res.render('index', {title: "Express"})
})

router.post('/upload', upload.single('imgs') ,function(req: express.Request, res: express.Response){      ///upload로 요청이 왔을 때, key가 imgs인 것만 업로드
    res.status(200).send('success')
})

router.post('/test', test.single('imgs'), function(req: express.Request, res: express.Response){
    res.status(200).send('success')
})

router.post('/cloudtest', function(req: express.Request, res: express.Response){
    let test = new DistributionController(res);
    test.getDistributionConfig()
})

module.exports = router