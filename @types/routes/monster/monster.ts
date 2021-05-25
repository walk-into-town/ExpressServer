/**
 * /monster
 */
import * as express from 'express'
import UploadFile from '../../modules/FileManager/UploadFile'
import MonsterManager from '../../modules/DBManager/MonsterManager'

var router = express.Router()
const uploader = new UploadFile()
const upload = uploader.testupload()

router.post('/monster', function(req: express.Request, res: express.Response){
    
})

router.get('/img', function(req: express.Request, res: express.Response){
    let query = req.query
    let monsterDB = new MonsterManager(req, res)
    monsterDB.read(query)
})

router.post('/img', upload.array('img'), function(req: express.Request, res: express.Response){
    let query = req.body
    let imgs: Array<string> = []
    for(let i = 0; i < req.files.length; i++){
        imgs.push(process.env.domain + req.files[i].filename)
    }
    query.imgs = imgs
    let monsterDB = new MonsterManager(req, res)
    monsterDB.insert(query)
})

module.exports = router