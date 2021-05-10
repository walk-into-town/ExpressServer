/**
 * /campaign/pinpoint
 */
import * as express from 'express'

import UploadFile from '../../modules/FileManager/UploadFile'     //파일 업로드 클래스 import
import PinpointManager from '../../modules/DBManager/PinpointManager'
import * as dotenv from 'dotenv'
import isAuthenticated from '../../middlewares/authentication'


const detail = require('./pinpointDetail')
const quiz = require('./PinpointQuiz')

var router = express.Router()
dotenv.config()

let uploader = new UploadFile()
let upload = uploader.testupload()


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

router.get('/', function(req: express.Request, res: express.Response){
    let query = req.body
    let pinpointDB = new PinpointManager(req, res)
    if(query.type == 'single'){
        let read: Array<any> = []
        if(typeof(query.id) == 'string'){
            read.push({'id': query.id})
        }
        else{
            query.id.forEach(id => {
                let obj = {'id': id}
                read.push(obj)
            });
        }
        pinpointDB.read(read)
    }
    else{
        pinpointDB.readList(query) 
    }
})

// router.post('/inquiry', function(req: express.Request, res: express.Response){
//     let query = req.body
//     let pinpointDB = new PinpointManager(req, res)
//     pinpointDB.read([query])
// })

router.delete('/', isAuthenticated, function(req: express.Request, res: express.Response){
    let query = req.body
    let pinpointDB = new PinpointManager(req, res)
    pinpointDB.delete(query)
})

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

router.use('/detail', detail)
router.use('/quiz', quiz)



module.exports = router