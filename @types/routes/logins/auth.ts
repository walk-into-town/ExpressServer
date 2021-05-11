/**
 * /auth
 */
import * as express from 'express'
var router = express.Router()
var passport = require('passport')

router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email'],
    accessType: 'offline'
  })
  )
  
router.get('/google/callback', passport.authenticate('google', {failureRedirect: 'login/result/fail'}),
  function(req, res){
    console.log(`응답 JSON\n${JSON.stringify(req.user, null, 2)}`)
    res.send(req.user)
  }
)

router.get('/kakao', passport.authenticate('kakao'))

router.get('/kakao/callback', passport.authenticate('kakao', {failureRedirect: 'login/result/fail'}),
  function(req, res){
    console.log(`응답 JSON\n${JSON.stringify(req.user, null, 2)}`)
    res.send(req.user)
  }
)

module.exports = router