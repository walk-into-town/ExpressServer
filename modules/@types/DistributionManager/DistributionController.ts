import {CloudfrontConnection} from './CloudfrontConnection'
import * as aws from 'aws-sdk'
import * as express from 'express'

export class DistributionController{
    private cloudconn: aws.CloudFront
    private res: express.Response

    constructor(res: express.Response){
        this.cloudconn = CloudfrontConnection.getCloudfront()
        this.res = res
    }

    public getDistributionConfig(){
        const run = async() => {        //비동기 함수로 배포 설정을 가져옴
            console.log('start')
            try{
                const results = await this.cloudconn.getDistributionConfig({Id: 'E2TJXQ9T2CU6A3'}).promise();
                return results.DistributionConfig
            }
            catch(err){
                console.error(err)
            }
        }

        let respond = async() => {      //run()에서 넘어온 배포 설정 JSON을 respond
            let result = await run()
            this.res.status(200).send(JSON.stringify(result, null, 2))
        }
        respond()
    }

    public listDistributions(){
       var params = {};
        this.cloudconn.listDistributions(params, function (err, data) {
            if (err) {
                console.log(err, err.stack);
            }
            else {
                data.DistributionList.Items.forEach((item) => console.log(JSON.stringify(item)));
            }
        });
    }
}