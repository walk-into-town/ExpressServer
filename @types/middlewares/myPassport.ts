import * as dotenv from 'dotenv'
import SocialReg from '../modules/DBManager/SocialRegister'

dotenv.config()
const AWS = require('aws-sdk')
AWS.config.update({
  accessKeyId: process.env.aws_access_key_id,
  secretAccessKey: process.env.aws_secret_access_key,
  region: 'us-east-1',
  endpoint: 'http://localhost:8000'
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
        dotenv.config()
        AWS.config.update({
          region: 'us-east-1',
          endpoint: 'http://localhost:8000'
        })
        let doclient = new AWS.DynamoDB.DocumentClient()
        let result = await doclient.query({
          TableName: 'Member',
          KeyConditionExpression: 'id = :id',
          ExpressionAttributeValues: {':id' : username}
        }).promise()
        if(result.Items[0] == undefined){
          return done(null, false, {message: 'Invalid Username'})
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
            return done(null, false, {message: 'Invalid Password'})
        }
    }
    ))

    passport.use(new GoogleStrategy({
      clientID: process.env.googleID,
      clientSecret: process.env.googleSecret,
      callbackURL: "https://localhost:3001/auth/google/callback"
    },
    function(accessToken, refreshToken, profile, cb) {
      let doclient = new AWS.DynamoDB.DocumentClient()
      let username = `google${profile.id}`
      let params = {
        TableName: 'Member',
        KeyConditionExpression: 'id = :id',
        ExpressionAttributeValues: {':id' : username}
      }
      const run = async() => {
        console.log(profile._json.picture)
        let data = await doclient.query(params).promise()
        let result = data.Items[0]
        if(result == undefined){  //id 없는경우
          let query = {
            id: username,
            pw: accessToken,
            nickname: 'Guest randmom',
            isManager: false
          }
          let social = new SocialReg()
          await social.insert(query)
          let user = {
            id: username,
            nickname: ' ',
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