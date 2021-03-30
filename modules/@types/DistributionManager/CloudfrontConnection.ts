import * as aws from 'aws-sdk'

export class CloudfrontConnection{
    private static cloudfront: aws.CloudFront
    public static getCloudfront():aws.CloudFront {
        aws.config.update({
            "accessKeyId": process.env.AWS_S3_KEYID,
            "secretAccessKey": process.env.AWS_S3_SECRETKEY,
            "region": "ap-northeast-2"
        })
        this.cloudfront = new aws.CloudFront()
        return this.cloudfront
    }
}