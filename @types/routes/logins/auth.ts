import * as express from 'express'
var router = express.Router()
var passport = require('passport')

router.get('/google', passport.authenticate('google', {
    scope: ['profile'],
    accessType: 'offline'
  })
  )
  
router.get('/google/callback', passport.authenticate('google', {failureRedirect: 'login/result/fail'}),
  function(req, res){
      res.send(req.user)
  }
)

module.exports = router