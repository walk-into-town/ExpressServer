import * as express from 'express'
import UploadFile from '../../modules/FileManager/UploadFile'

var router = express.Router()
const uploader = new UploadFile()
const upload = uploader.testupload()

router.post('/monster/inquiryimg', function(req: express.Request, res: express.Response){

})

router.post('/monster/registerimg', upload.single('img'), function(req: express.Request, res: express.Response){
    
})

router.post('/clear', function(req: express.Request, res: express.Response){
    
})

router.post('/ranking/inquiry', function(req: express.Request, res: express.Response){
    
})

module.exports = router