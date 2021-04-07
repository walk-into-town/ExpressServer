import * as aws from 'aws-sdk'
import * as dotenv from 'dotenv'

export class S3Connection{
    private s3: aws.S3
    constructor(){
        dotenv.config(); //환경 변수 불러오기
        aws.config.update({
            "accessKeyId": process.env.AWS_S3_KEYID,
            "secretAccessKey": process.env.AWS_S3_SECRETKEY,
            //"region": "ap-northeast-2"
            "region": 'ap-northeast-2'
        })
        this.s3 = new aws.S3();
    }

    public getS3():aws.S3 {
        return this.s3
    }
}