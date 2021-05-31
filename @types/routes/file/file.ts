/**
 * /game
 */
 import * as express from 'express'
 import UploadFile from '../../modules/FileManager/UploadFile'
import { error, fail, success } from '../../static/result'
 
 var router = express.Router()
 const uploader = new UploadFile()
 const upload = uploader.testupload()
 
 
 router.post('/', upload.array('imgs'), function(req: express.Request, res: express.Response){
    let imgs: Array<string> = []
    if(req.files != undefined){
        for(let i = 0; i < req.files.length; i++){
            imgs.push(process.env.domain + req.files[i].filename)
        }
    }
    else{
        fail.error = error.invalFile
        fail.errdesc = '파일 전송 에러. 파일이 누락되었거나 전송 도중 손상되었습니다.'
        res.status(400).send(fail)
        return;
    }
    success.data = imgs
    res.status(201).send(success)
 })
 
 module.exports = router