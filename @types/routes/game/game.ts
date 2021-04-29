import * as express from 'express'
import UploadFile from '../../modules/FileManager/UploadFile'
import MonsterManager from '../../modules/DBManager/MonsterManager'

var router = express.Router()
const uploader = new UploadFile()
const upload = uploader.testupload()

router.post('/monster/inquiryimg', function(req: express.Request, res: express.Response){
    
})

router.post('/monster/registerimg', upload.array('img'), function(req: express.Request, res: express.Response){
    let query = req.body
    let imgs: Array<string> = []
    for(let i = 0; i < req.files.length; i++){
        imgs.push("https://walk-into-town.ga/" + req.files[i].filename)
    }
    query.imgs = imgs
    let monsterDB = new MonsterManager(req, res)
    monsterDB.insert(query)
})

router.post('/clear', function(req: express.Request, res: express.Response){
    
})

router.post('/ranking/inquiry', function(req: express.Request, res: express.Response){
    
})

module.exports = router