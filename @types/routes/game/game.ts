/**
 * /game
 */
import * as express from 'express'
import UploadFile from '../../modules/FileManager/UploadFile'
import MonsterManager from '../../modules/DBManager/MonsterManager'

var router = express.Router()
const uploader = new UploadFile()
const upload = uploader.testupload()


router.put('/clear', function(req: express.Request, res: express.Response){
    
})

router.get('/ranking', function(req: express.Request, res: express.Response){
    
})

module.exports = router