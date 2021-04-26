/**
 * Set session
 */
import * as dotenv from 'dotenv'
dotenv.config()
const session = require('express-session')
const AWS = require('aws-sdk')
AWS.config.update({
  accessKeyId: process.env.aws_access_key_id,
  secretAccessKey: process.env.aws_secret_access_key,
  region: 'us-east-1',
  endpoint: 'http://localhost:8000'
})
const dynamodb = new AWS.DynamoDB()
var DynamoDBStore = require('connect-dynamodb')(session)

function getSession() {
    return session({
        secret: 'SessionSecret',
        resave: false,                //세션에 변경사항이 생길때만 저장 O
        saveUninitialized: false,     //세션 생성 전에는 저장 X
        rolling: true,                //요청때마다 세션 갱신
        store: new DynamoDBStore({    //default: 메모리에 저장 -> 분산 처리 문제 + EC2의 메모리 부족 -> DynamoDB에 저장
          table: 'Session',           //세션을 저장할 테이블 명
          reapInterval: 1000,   //만료된 세션 정리 간격 (ms). 1시간마다 정리
          client: dynamodb            //사용할 DyanmoDB 클라이언트.
        }),
        cookie:{
          maxAge: 1000*60*3,           //토큰 유효 시간 (ms). 3시간동안 유효
          httpOnly: true,              //http통신에서만 쿠키 확인 가능 -> 클라이언트의 script에서 불가
      //    secure: true               //https에서만 쿠키 전달
        }
      })
};

module.exports =  getSession