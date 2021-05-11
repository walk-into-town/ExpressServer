import DBConnection from './DBConnection'
import * as bcrypt from 'bcrypt'

export default class SocialRegister{
    public insert(params: any) {
        let dbConn = new DBConnection()
        let dynamodb = dbConn.getDynamoDB()
        let pw: string; let saltRounds = 10
        const run = async () => {
            await bcrypt.hash(params.pw, saltRounds).then(function(hash){
                pw = hash
              })
              var queryParams = {
                TableName: 'Member',
                Item: {
                    id: params.id,
                    pw: pw,
                    profileImg: params.profileImg,
                    nickname: params.nickname,
                    isManager: params.isManager,
                    primeBadge: null,
                    badge: [],
                    coupons: [],
                    myCampaigns: [],
                    playingCampaigns: [],
                    selfIntroduction: '자기소개를 꾸며보세요.'
                },
                ConditionExpression: "attribute_not_exists(id)"      //항목 추가하기 전에 이미 존재하는 항목이 있을 경우 pk가 있을 때 조건 실패. pk는 반드시 있어야 하므로 replace를 방지
            }
            await dynamodb.put(queryParams).promise()
        }
        return run()
    }
}