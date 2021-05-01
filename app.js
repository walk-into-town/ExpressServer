var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const flash = require('connect-flash')

var passport = require('passport')
var passportConfig = require('./@js/middlewares/myPassport')

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

/**
* Set Passport
*/
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())
passportConfig();


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
