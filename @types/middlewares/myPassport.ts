import * as dotenv from "dotenv";
import SocialReg from "../modules/DBManager/SocialRegister";

dotenv.config();
const AWS = require("aws-sdk");
AWS.config.update({
  accessKeyId: process.env.aws_access_key_id,
  secretAccessKey: process.env.aws_secret_access_key,
  region: process.env.dynamoRegion,
  endpoint: process.env.dynamoEndpoint,
});
const bcrypt = require("bcrypt");

const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

module.exports = () => {
  // 전략에서 넘어온 User값을 세션에 저장하는 함수
  passport.serializeUser(function (user: string, done: Function) {
    done(null, user);
  });

  // DB에 저장된 세션과 비교할 때 사용하는 함수
  passport.deserializeUser(function (id: string, done: Function) {
    done(null, id);
  });

  passport.use(
    new LocalStrategy(
      {
        //전략 객체 생성에는 옵션 + 처리 함수
        usernameField: "id",
        passwordField: "pw",
      },
      async function (username: string, password: string, done: Function) {
        AWS.config.update({
          region: process.env.dynamoRegion,
          endpoint: process.env.dynamoEndpoint,
        });
        let doclient = new AWS.DynamoDB.DocumentClient();
        console.log("로컬 계정 로그인");
        let prisonResult = await doclient
          .query({
            TableName: "Prison",
            KeyConditionExpression: "id = :id",
            ExpressionAttributeValues: { ":id": username },
          })
          .promise();
        let prison = prisonResult.Items[0];
        if (prison != undefined) {
          let endTime = new Date(prison.startTime).getTime() + prison.time;
          let currTime = new Date(Date.now() + 9 * 60 * 60 * 1000).getTime();
          if (endTime > currTime) {
            let diff = endTime - currTime;
            let hour = Math.floor(diff / 1000 / 60 / 60);
            let min = Math.floor(diff / 1000 / 60) % 60;
            let sec = Math.floor(diff / 1000) % 60;
            console.log("차단된 유저입니다.");
            return done(null, false, {
              message: `차단된 사용자입니다. 남은 시간 : ${hour}시간 ${min}분 ${sec}초`,
            });
          } else {
            let deleteParam = {
              TableName: "Prison",
              Key: { id: username },
            };
            await doclient.delete(deleteParam).promise();
          }
        }
        let result = await doclient
          .query({
            TableName: "Member",
            KeyConditionExpression: "id = :id",
            ExpressionAttributeValues: { ":id": username },
          })
          .promise();
        if (result.Items[0] == undefined) {
          console.log("ID 불일치");
          return done(null, false, {
            message: "ID 또는 패스워드가 잘못되었습니다.",
          });
        }
        if (result.Items[0].nickname == "(알수없음)") {
          console.log("삭제된 게정입니다.");
          return done(null, false, { message: "삭제된 게정입니다." });
        }
        console.log("ID 일치");
        let pw = result.Items[0].pw;
        console.log("PW 비교중...");
        const match = await bcrypt.compare(password, pw);
        if (match == true) {
          let user = {
            id: username,
            nickname: result.Items[0].nickname,
            profileImg: result.Items[0].profileImg,
            selfIntroduction: result.Items[0].selfIntroduction,
            quiz: [],
          };
          console.log("PW 일치");
          return done(null, user);
        } else {
          console.log("비밀번호 불일치");
          return done(null, false, {
            message: "ID 또는 패스워드가 잘못되었습니다.",
          });
        }
      }
    )
  );
};
