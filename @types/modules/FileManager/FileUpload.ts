import * as multer from 'multer'
import * as aws from 'aws-sdk'


export abstract class UploaderInterface{
   private s3: aws.S3
   private storage: multer.StorageEngine
   public uploadFile(src: string): multer.Multer { return multer.default({})}
}