/**
 * /campaign/evaluate/campaign
 */
import * as express from 'express'
import isAuthenticated from '../../middlewares/authentication'
import CampaignManager from '../../modules/DBManager/CampaignManager'
import UploadFile from '../../modules/FileManager/UploadFile'

var router = express.Router()
const uploader = new UploadFile()
const upload = uploader.testupload()


router.post('/comment', isAuthenticated, upload.array('img'), function(req: express.Request, res: express.Response){
    let query = req.body
    let campaignDB = new CampaignManager(req, res)
    let imgs: Array<string> = []
    if(req.files != undefined){
        for(let i = 0; i < req.files.length; i++){
            imgs.push(process.env.domain + req.files[i].filename)
        }
    }
    query.imgs = imgs
    campaignDB.insertComment(query)
})

router.get('/comment', function(req: express.Request, res: express.Response){
    
})

router.delete('/comment', isAuthenticated, function(req: express.Request, res: express.Response){
    
})

router.put('/comment', isAuthenticated, function(req: express.Request, res: express.Response){
    
})

router.put('/rate', isAuthenticated, function(req: express.Request, res: express.Response){

})
module.exports = router