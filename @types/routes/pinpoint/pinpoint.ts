/**
 * /pinpoint
 */
import * as express from 'express'

import UploadFile from '../../modules/FileManager/UploadFile'     //파일 업로드 클래스 import
import PinpointManager from '../../modules/DBManager/PinpointManager'
import * as dotenv from 'dotenv'
import isAuthenticated from '../../middlewares/authentication'
import { error, fail } from '../../static/result'
import { nbsp2plus } from '../../modules/Logics/nbsp'

const comment = require('./pinpointComment')
const detail = require('./pinpointDetail')
const quiz = require('./PinpointQuiz')

var router = express.Router()
dotenv.config()

let uploader = new UploadFile()
let upload = uploader.testupload()

router.use('/detail', detail)
router.use('/quiz', quiz)
router.use('/comment', comment)

//핀포인트 등록
router.post('/', isAuthenticated, upload.array('img'), function(req: express.Request, res: express.Response){
    let query = JSON.parse(req.body.json)
    let imgs: Array<string> = []
    if(req.files != undefined){
        for(let i = 0; i < req.files.length; i++){
            imgs.push(process.env.domain + req.files[i].filename)
        }
    }
    query.imgs = imgs
    let pinpointDB = new PinpointManager(req, res)
    pinpointDB.insert(query)

})

//핀포인트 조회
router.get('/', function(req: express.Request, res: express.Response){
    let query: any = req.query
    console.log(`요청 JSON\n${JSON.stringify(query)}`)
    let pinpointDB = new PinpointManager(req, res)
    if(query.type == 'single'){
        let read: Array<any> = []
        if(typeof(query.value) == 'string'){
            query.value = nbsp2plus(query.value)
            read.push({'id': query.value})
        }
        else{
            query.value.forEach(id => {
                id = nbsp2plus(id)
                let obj = {'id': id}
                read.push(obj)
            });
        }
        pinpointDB.read(read)
        return
    }
    if(query.type == 'list'){
        query.value = nbsp2plus(query.value)
        pinpointDB.readList(query)
        return; 
    }
    fail.error = error.invalReq
    fail.errdesc = 'type은 list | single중 하나여야 합니다.'
    res.status(400).send(fail)
})

// router.post('/inquiry', function(req: express.Request, res: express.Response){
//     let query = req.body
//     let pinpointDB = new PinpointManager(req, res)
//     pinpointDB.read([query])
// })

//핀포인트 삭제
router.delete('/', isAuthenticated, function(req: express.Request, res: express.Response){
    let query = req.body
    let pinpointDB = new PinpointManager(req, res)
    pinpointDB.delete(query)
})

//핀포인트 수정
router.put('/', isAuthenticated, upload.array('img'), function(req: express.Request, res: express.Response){
    let query = JSON.parse(req.body.json)
    let imgs: Array<string> = []
    for(let i =0; i < req.files.length; i++){
        imgs.push(process.env.domain + req.files[i].filename)
    }
    query.imgs = imgs
    let pinpointDB = new PinpointManager(req, res)
    pinpointDB.update(query)
})


module.exports = router