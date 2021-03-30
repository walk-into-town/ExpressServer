import {S3Connection} from './S3Connection'
import multer from 'multer'
import mime from 'mime-types'
import multerS3 from 'multer-s3'
var randstr = require('crypto-random-string')

export class UploadFile{
  private static s3;
  private static storage = multer.diskStorage({
    destination: function (req, file, cb){
      cb(null, 'uploads/')
    },
    filename: function (req, file, cb){
      let ext = `.${mime.extension(file.mimetype)}`
      let filename = randstr({length: 30})
      cb(null, filename + ext)
    }
  })

  public static test(): multer {
    let getS3 = new S3Connection();
    let s3 = getS3.getS3()
    let storage = multerS3({
      s3 : s3,
      bucket: 'testbucket102345',
      acl: 'public-read',
      key: function(req, file, cb){
        cb(null, Date.now() + '.' + file.originalname.split('.').pop());
      }
    })

    const upload = multer({
      storage : storage
    }, 'NONE')
    return upload
  }

  public static uploadFile(): multer {
    return multer({storage: UploadFile.storage})
  }
} 