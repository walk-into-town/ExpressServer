import * as dotenv from 'dotenv'
import SocialReg from '../modules/DBManager/SocialRegister'

dotenv.config()
const AWS = require('aws-sdk')
AWS.config.update({
  accessKeyId: process.env.aws_access_key_id,
  secretAccessKey: process.env.aws_secret_access_key,
  region: process.env.dynamoRegion,
  endpoint: process.env.dynamoEndpoint
})
const bcrypt = require('bcrypt')

var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy
var GoogleStrategy = require('passport-google-oauth20').Strategy

module.exports = () => {
    passport.serializeUser(function(user: string, done: Function){
        done(null, user)
    })
    
    passport.deserializeUser(function(id: string ,done: Function){
        done(null, id)
    })

    passport.use(new LocalStrategy({
        usernameField: 'id',
        passwordField: 'pw'
    },
    async function(username: string, password: string, done: Function){
        AWS.config.update({
          region: process.env.dynamoRegion,
          endpoint: process.env.dynamoEndpoint
        })
        let doclient = new AWS.DynamoDB.DocumentClient()
        let result = await doclient.query({
          TableName: 'Member',
          KeyConditionExpression: 'id = :id',
          ExpressionAttributeValues: {':id' : username}
        }).promise()
        if(result.Items[0] == undefined){
          return done(null, false, {message: 'ID 또는 패스워드가 잘못되었습니다.'})
        }
        let pw = result.Items[0].pw
        const match = await bcrypt.compare(password, pw)
        if(match == true){
            let user = {
                id: username,
                nickname: result.Items[0].nickname,
                profileImg: result.Items[0].profileImg,
                selfIntroduction: result.Items[0].selfIntroduction
            }
            return done(null, user)
        }
        else{
            return done(null, false, {message: 'ID 또는 패스워드가 잘못되었습니다.'})
        }
    }
    ))

    passport.use(new GoogleStrategy({             // 구글 전략 설정
      clientID: process.env.googleID,             // OAuth 생성시 API 호출을 위한 ID, Secret
      clientSecret: process.env.googleSecret,
      callbackURL: process.env.googleAuthCallback // 로그인 성공시 이동하는 페이지
    },
    function(accessToken, refreshToken, profile, cb) {      // 로그인 성공시 callback 페이지에서 호출하는 함수
      let doclient = new AWS.DynamoDB.DocumentClient()
      let username = `google${profile.id}`
      let params = {
        TableName: 'Member',
        KeyConditionExpression: 'id = :id',
        ExpressionAttributeValues: {':id' : username}
      }
      const run = async() => {
        const getRandomNumber = () => {           //GUEST 계정을 위한 닉네임 번호 생성
          const array = new Uint32Array(1);
          window.crypto.getRandomValues(array)
          return array[0]
        }
        console.log(profile._json.picture)
        let data = await doclient.query(params).promise()
        let result = data.Items[0]
        if(result == undefined){  //id 없는경우
          let query = {
            id: username,
            pw: accessToken,
            nickname: `손님 ${getRandomNumber()}`,
            isManager: false
          }
          let social = new SocialReg()
          await social.insert(query)
          let user = {
            id: username,
            nickname: query.nickname,
            profileImg: '',
            selfIntroduction: ''
        }
          return cb(null, user)
        }
        else{
          let user = {
            id: username,
            nickname: result.nickname,
            profileImg: result.profileImg,
            selfIntroduction: result.selfIntroduction           
          }
          return cb(null, user)
        }
      }
      run()
    }
  ));
}