/**
 * /pinpoint/comment
 */
import * as express from 'express'
import isAuthenticated from '../../middlewares/authentication'
import UploadFIle from '../../modules/FileManager/UploadFile'
import PinpointManager from '../../modules/DBManager/PinpointManager'

let uploader = new UploadFIle()
let upload = uploader.testupload()

var router = express.Router()


router.post('/', isAuthenticated, upload.array('img'), function(req: express.Request, res: express.Response){
    let query = req.body
    let imgs: Array<string> = []
    if(req.files != undefined){
        for(let i = 0; i < req.files.length; i++){
            imgs.push(process.env.domain + req.files[i].filename)
        }
    }
    query.imgs = imgs
    let pinpointDB = new PinpointManager(req, res)
    console.log(query)
    pinpointDB.insertComment(query)

})

router.get('/', function(req: express.Request, res: express.Response){
    let query = req.query
    let pinpointDB = new PinpointManager(req, res)
    pinpointDB.readComment(query)
})

router.delete('/', isAuthenticated, function(req: express.Request, res: express.Response){
    let query = req.body
    let pinpointDB = new PinpointManager(req, res)
    pinpointDB.deleteComment(query)
})

router.put('/', isAuthenticated, function(req: express.Request, res: express.Response){
    let query = req.body
    let pinpointDB = new PinpointManager(req, res)
    pinpointDB.updateComment(query)
})

router.put('/rate', isAuthenticated, function(req: express.Request, res: express.Response){
    let query = req.body
    let pinpointDB = new PinpointManager(req, res)
    pinpointDB.updateRate(query)
})

module.exports = router