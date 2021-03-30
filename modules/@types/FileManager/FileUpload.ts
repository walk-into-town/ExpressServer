module FileManager{
    let multer = require('multer')
    let S3 = require('./S3Connection')
    export interface FileUpload{
       // s3: typeof(S3)
       // uploadFile(): typeof(multer)
    }
}