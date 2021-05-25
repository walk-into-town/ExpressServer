/**
 * /campaign/review
 */
import * as express from 'express'
import isAuthenticated from '../../middlewares/authentication'
import CampaignManager from '../../modules/DBManager/CampaignManager'
import UploadFile from '../../modules/FileManager/UploadFile'

var router = express.Router()
const uploader = new UploadFile()
const upload = uploader.testupload()


router.post('/', isAuthenticated, upload.array('imgs'), function(req: express.Request, res: express.Response){
    let query = req.body
    let campaignDB = new CampaignManager(req, res)
    let imgs: Array<string> = []
    if(req.files != undefined){
        for(let i = 0; i < req.files.length; i++){
            imgs.push(process.env.domain + req.files[i].filename)
        }
    }
    query.imgs = imgs
    campaignDB.insertrReview(query)
})

router.get('/', function(req: express.Request, res: express.Response){
    let query = req.query
    let campaignDB = new CampaignManager(req, res)
    campaignDB.readReview(query)
})

router.delete('/', isAuthenticated, function(req: express.Request, res: express.Response){
    let query = req.body
    let camaignDB = new CampaignManager(req, res)
    camaignDB.deleteReview(query)
})

router.put('/', isAuthenticated, upload.array('imgs'), function(req: express.Request, res: express.Response){
    let query = req.body
    let campaignDB = new CampaignManager(req, res)
    let imgs: Array<string> = []
    if(req.files != undefined){
        for(let i = 0; i < req.files.length; i++){
            imgs.push(process.env.domain + req.files[i].filename)
        }
    }
    query.imgs = imgs
    campaignDB.updateReview(query)
})

module.exports = router