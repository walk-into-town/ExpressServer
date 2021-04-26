import * as express from 'express'
import PinpointManager from '../../modules/DBManager/PinpointManager'
var router = express.Router()


router.post('/register', function(req: express.Request, res: express.Response){
    let query = req.body
    let DBManager = new PinpointManager(req, res)
    DBManager.insertQuiz(query)
})

router.post('/inquiry', function(req: express.Request, res: express.Response){
    let query = req.body
    let DBManager = new PinpointManager(req, res)
    DBManager.readQuiz(query)
})

router.post('/delete', function(req: express.Request, res: express.Response){
    let query = req.body
    query.quiz = null
    let DBManager = new PinpointManager(req, res)
    DBManager.updateQuiz(query)
})

router.post('/modify', function(req: express.Request, res: express.Response){
    let query = req.body
    let DBManager = new PinpointManager(req, res)
    DBManager.updateQuiz(query)
})

module.exports = router