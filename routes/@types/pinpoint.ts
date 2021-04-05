import * as express from 'express'

import {UploadFile} from '../../modules/@js/FileManager/UploadFile'     //파일 업로드 클래스 import
import {PinpointManager} from '../../modules/@js/DBManager/PinpointManager'


const detail = require('./pinpointDetail')
const quiz = require('./PinpointQuiz')

var router = express.Router()

let uploader = new UploadFile()
let upload = uploader.uploadFile('witpinpointimgss')


router.post('/register', upload.array('img'), function(req: express.Request, res: express.Response){
    let query = JSON.parse(req.body.json)
    let imgs: Array<string> = []
    for(let i = 0; i < req.files.length; i++){
        imgs.push(req.files[i].filename)
    }
    query.imgs = imgs
    let pinpointDB = new PinpointManager(req, res)
    pinpointDB.insert(query)

})

router.post('/list', function(req: express.Request, res: express.Response){
    let query = JSON.parse(req.body.json)
    let pinpointDB = new PinpointManager(req, res)
    pinpointDB.read(query)
})

router.post('/inquiry', function(req: express.Request, res: express.Response){
    let query = JSON.parse(req.body.json)
    let pinpointDB = new PinpointManager(req, res)
    pinpointDB.read([query])
})

router.post('/delete', function(req: express.Request, res: express.Response){
    let query = JSON.parse(req.body.json)
    let pinpointDB = new PinpointManager(req, res)
    pinpointDB.delete(query)
})

router.post('/modify', upload.array('img'), function(req: express.Request, res: express.Response){
    let query = JSON.parse(req.body.json)
    let imgs: Array<string> = []
    for(let i =0; i < req.files.length; i++){
        imgs.push(req.files[i].filename)
    }
    query.imgs = imgs
    let pinpointDB = new PinpointManager(req, res)
    pinpointDB.update(query)
})

router.use('/detail', detail)
router.use('/quiz', quiz)



module.exports = router