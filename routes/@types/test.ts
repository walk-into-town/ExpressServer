import * as express from 'express'
var router = express.Router()
import {UploadFile} from '../../modules/@js/FileManager/UploadFile'     //파일 업로드 클래스 import
import {DistributionController} from '../../modules/@js/DistributionManager/DistributionController'
import {DBConnection} from '../../modules/@js/DBManager/DBConnection'


// let uploader = new UploadFile()
let uploader = new UploadFile()
let upload = uploader.uploadFile('test')        //static 함수로 선언된 uploadFile을 통해 업로드를 위한 multer 객체 획득

router.get('/', function(req: express.Request, res: express.Response, next: Function){
    res.render('index', {title: "Express"})
})

router.post('/upload', upload.array('imgs') ,function(req: express.Request, res: express.Response){      ///upload로 요청이 왔을 때, key가 imgs인 것만 업로드
    res.status(200).send('success')
})

router.post('/test', upload.single('imgs'), function(req: express.Request, res: express.Response){
    console.log(req.body.test)
    res.status(200).send('success')
})

router.post('/cloudtest', function(req: express.Request, res: express.Response){
    let test = new DistributionController(res);
    test.getDistributionConfig()
})

router.get('/dbtest', function(req: express.Request, res: express.Response){
    res.status(200).send('success')
})

router.get('/dateTest', function (req, res){
    async function test(){
        let date1 = new Date()
        await new Promise((r) => setTimeout(r, 7000))
        let date2 = new Date()

        console.log(date1)
        console.log(date2)
        let date3 = new Date(Date.parse('2021-04-03T10:53:39.025Z'))
        console.log(date3)
    }
    test()
})

module.exports = router