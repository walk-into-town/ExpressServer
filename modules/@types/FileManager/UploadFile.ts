import {S3Connection} from './S3Connection'
import {UploaderInterface} from './FileUpload'
import * as aws from 'aws-sdk'
import * as multer from 'multer'
import mime from 'mime-types'
import randstr from 'crypto-random-string'
let multerS3 = require('multer-s3')

export class UploadFile implements UploaderInterface{
  private static s3: aws.S3;
  private static storage = multer.diskStorage({
    destination: function (req: Express.Request, file: Express.Multer.File, cb: Function){    //callback함수에 파일 저장 위치를 지정
      cb(null, 'uploads/')
    },
    filename: function (req: Express.Request, file: Express.Multer.File, cb: Function){       //callback함수에 저장할 파일 이름 지정
      let ext = `.${mime.extension(file.mimetype)}`   //file.mimetype을 통해 mimeType을 얻어내고 mime-types모듈의 extension을 통해 확장자명 지정
      let filename = randstr({length: 30})            //crypto-random-string을 통해 무작위 이름 생성
      cb(null, filename + ext)
    }
  })

  public static test(): multer.Multer {
    let getS3 = new S3Connection();
    let s3: aws.S3 = getS3.getS3()              //S3Connection클래스에서 S3 객체를 획득
    let storage = multerS3({            //multerS3를 통해 파일 업로드
      s3 : s3,
      bucket: 'testbucket102345',
      acl: 'public-read',
      contentType: multerS3.AUTO_CONTENT_TYPE,
      key: function(req: Express.Request, file: Express.Multer.File, cb: Function){
        cb(null, Date.now() + '.' + file.originalname.split('.').pop());
      }
    })
    const upload = multer.default({
      storage : storage
    })
    return upload
  }

  public static uploadFile(): multer.Multer {
    return multer.default({storage: UploadFile.storage})
  }
} 