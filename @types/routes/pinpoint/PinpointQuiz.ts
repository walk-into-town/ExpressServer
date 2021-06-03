/**
 * /pinpoint/quiz
 */
import * as express from 'express'
import PinpointManager from '../../modules/DBManager/PinpointManager'
import isAuthenticated from '../../middlewares/authentication'

var router = express.Router()


router.post('/', isAuthenticated, function(req: express.Request, res: express.Response){
    let query = req.body
    let DBManager = new PinpointManager(req, res)
    DBManager.insertQuiz(query)
})

router.get('/', function(req: express.Request, res: express.Response){
    let query = req.query
    let DBManager = new PinpointManager(req, res)
    DBManager.readQuiz(query)
})

router.delete('/', isAuthenticated, function(req: express.Request, res: express.Response){
    let query = req.body
    query.quiz = null
    let DBManager = new PinpointManager(req, res)
    DBManager.updateQuiz(query)
})

router.put('/', isAuthenticated, function(req: express.Request, res: express.Response){
    let query = req.body
    let DBManager = new PinpointManager(req, res)
    DBManager.updateQuiz(query)
})

router.post('/solve', isAuthenticated, function(req: express.Request, res: express.Response){
    let query = req.body
    let DBManager = new PinpointManager(req, res)
    DBManager.solveQuiz(query)
})

router.get('/check', isAuthenticated, function(req: express.Request, res: express.Response){
    let query = req.query
    let DBManager = new PinpointManager(req, res)
    DBManager.checkQuiz(query)
})

module.exports = router