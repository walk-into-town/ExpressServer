import * as multer from 'multer'
import * as aws from 'aws-sdk'


export abstract class UploaderInterface{
   private static s3: aws.S3
   private static storage: multer.StorageEngine
   public static uploadFile(): multer.Multer { return multer.default({})}
}