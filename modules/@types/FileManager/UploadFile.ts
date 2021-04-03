import {S3Connection} from './S3Connection'
import {UploaderInterface} from './FileUpload'
import * as aws from 'aws-sdk'
import * as multer from 'multer'
import mime from 'mime-types'
import randstr from 'crypto-random-string'
import * as express from 'express'
let multerS3 = require('multer-s3')

export class UploadFile extends UploaderInterface{
  public uploadFile(src: string): multer.Multer {
    let getS3 = new S3Connection();
    let s3: aws.S3 = getS3.getS3()              //S3Connection클래스에서 S3 객체를 획득
    let storage = multerS3({            //multerS3를 통해 파일 업로드
      s3 : s3,
      bucket: src,
      acl: 'public-read',
      contentType: multerS3.AUTO_CONTENT_TYPE,
      key: function(req: express.Request, file: Express.Multer.File, cb: Function){
          let ext = `.${mime.extension(file.mimetype)}`
          let filename = randstr({length: 40})
          cb(null, filename + ext)
          file.filename = filename + ext        //라우터에 생성된 파일 명을 전달하기 위해서
      }
    })
    const upload = multer.default({
      storage : storage
    })
    return upload
  }
} 