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
  // 전략에서 넘어온 User값을 세션에 저장하는 함수
    passport.serializeUser(function(user: string, done: Function){
        done(null, user)
    })
    
    // DB에 저장된 세션과 비교할 때 사용하는 함수
    passport.deserializeUser(function(id: string ,done: Function){
        done(null, id)
    })

    passport.use(new LocalStrategy({      //전략 객체 생성에는 옵션 + 처리 함수
        usernameField: 'id',
        passwordField: 'pw'
    },
    async function(username: string, password: string, done: Function){
        AWS.config.update({
          region: process.env.dynamoRegion,
          endpoint: process.env.dynamoEndpoint
        })
        let doclient = new AWS.DynamoDB.DocumentClient()
        console.log('로컬 계정 로그인')
        let result = await doclient.query({
          TableName: 'Member',
          KeyConditionExpression: 'id = :id',
          ExpressionAttributeValues: {':id' : username}
        }).promise()
        if(result.Items[0] == undefined){
          console.log('ID 불일치')
          return done(null, false, {message: 'ID 또는 패스워드가 잘못되었습니다.'})
        }
        console.log('ID 일치')
        let pw = result.Items[0].pw
        console.log('PW 비교중...')
        const match = await bcrypt.compare(password, pw)
        if(match == true){
            let user = {
                id: username,
                nickname: result.Items[0].nickname,
                profileImg: result.Items[0].profileImg,
                selfIntroduction: result.Items[0].selfIntroduction
            }
            console.log('PW 일치')
            return done(null, user)
        }
        else{
          console.log('비밀번호 불일치')
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
        console.log('구글 로그인')
        const getRandomNumber = () => {           //GUEST 계정을 위한 닉네임 번호 생성
          const array = new Uint32Array(1);
          window.crypto.getRandomValues(array)
          return array[0]
        }
        console.log(profile._json.picture)
        let data = await doclient.query(params).promise()
        let result = data.Items[0]
        if(result == undefined){  //id 없는경우
          console.log('새로운 구글 ID')
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
        else{               // 기존에 로그인 했던 경우
          console.log('기존에 사용한 구글 ID')
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