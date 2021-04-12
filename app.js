var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

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
var session = require('express-session')
const AWS = require('aws-sdk')
AWS.config.update({region: 'us-east-1'})
var DynamoDBStore = require('connect-dynamodb')(session)
app.use(session({
  secret: 'SessionSecret',
  resave: true,                //세션에 변경사항 생기기면 저장 O
  saveUninitialized: false,     //세션 생성 전에는 저장 X
  store: new DynamoDBStore({    //메모리에 넣는 것이 아닌 DynamoDB에 넣기 위한 부분.
    table: 'Session',
    AWSConfigJSON:{
      accessKeyId: process.env.aws_access_key_id,
      secrestAccessKey: process.env.aws_secret_access_key,
      region: 'us-east-1'
    },
    client: new AWS.DynamoDB({endpoint: new AWS.Endpoint('http://localhost:8000')})
  }),
  cookie:{
    maxAge: 1000*60*60,        //토큰 유효 시간.
  }
}))

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
