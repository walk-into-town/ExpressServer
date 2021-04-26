var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const middle = require('./@js/middlewares/sessionMiddle')

var app = express();

/**
 * set static img folder
 */
app.use(express.static('uploads'));


// redirect HTTP to HTTPS
// app.all('*', (req, res, next) => {
//   let protocol = req.headers['x-forwarded-proto'] || req.protocol;
//   if (protocol == 'https') { next(); }
//   else {
//           let from = `${protocol}://${req.hostname}${req.url}`;
//           let to = `https://${req.hostname}${req.url}`;
//           // log and redirect
//           console.log(`[${req.method}]: ${from} -> ${to}`);
//           res.redirect(to); }
//   }
// );


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Set session
 */

const session = require('./@js/middlewares/session')
app.use(session())

// const dotenv = require('dotenv')
// dotenv.config()
// var session = require('express-session')
// const AWS = require('aws-sdk')
// AWS.config.update({
//   accessKeyId: process.env.aws_access_key_id,
//   secretAccessKey: process.env.aws_secret_access_key,
//   region: 'us-east-1',
//   endpoint: 'http://localhost:8000'
// })
// const dynamodb = new AWS.DynamoDB()
// var DynamoDBStore = require('connect-dynamodb')(session)
// app.use(session({
//   secret: 'SessionSecret',
//   resave: false,                //세션에 변경사항이 생길때만 저장 O
//   saveUninitialized: false,     //세션 생성 전에는 저장 X
//   rolling: true,                //요청때마다 세션 갱신
//   store: new DynamoDBStore({    //default: 메모리에 저장 -> 분산 처리 문제 + EC2의 메모리 부족 -> DynamoDB에 저장
//     table: 'Session',           //세션을 저장할 테이블 명
//     reapInterval: 1000*60*60,   //만료된 세션 정리 간격 (ms). 1시간마다 정리
//     client: dynamodb            //사용할 DyanmoDB 클라이언트.
//   }),
//   cookie:{
//     maxAge: 1000*60*3,           //토큰 유효 시간 (ms). 3시간동안 유효
//     httpOnly: true,              //http통신에서만 쿠키 확인 가능 -> 클라이언트의 script에서 불가
// //    secure: true               //https에서만 쿠키 전달
//   }
// }))

/**
 * Persional MiddleWares
 */

 app.use(middle.sessionCheck)

/**
 * set routes
 */
const routes = require('./@js/routes')
app.use(routes)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});




module.exports = app;
