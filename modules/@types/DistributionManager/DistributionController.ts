import {CloudfrontConnection} from './CloudfrontConnection'
import * as aws from 'aws-sdk'

export class DistributionController{
    cloudconn: aws.CloudFront
    constructor(){
        this.cloudconn = CloudfrontConnection.getCloudfront()
    }
}