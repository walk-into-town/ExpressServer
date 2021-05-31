/**
 * /game
 */
import * as express from 'express'
import UploadFile from '../../modules/FileManager/UploadFile'
import MonsterManager from '../../modules/DBManager/MonsterManager'
import Rankingmanager from '../../modules/DBManager/RankingManager'

var router = express.Router()
const uploader = new UploadFile()
const upload = uploader.testupload()


router.put('/clear', function(req: express.Request, res: express.Response){
    
})

router.get('/ranking', function(req: express.Request, res: express.Response){
    let query = req.query
    let rankingManaber = new Rankingmanager(req, res)
    rankingManaber.read(query)
})

module.exports = router