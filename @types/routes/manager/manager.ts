/**
 * /manager
 */
import * as express from 'express'
import isAuthenticated from '../../middlewares/authentication'
import Reportmanager from '../../modules/DBManager/ReportManager'

var router = express.Router()

router.post('/report', function(req: express.Request, res: express.Response){
    let reportDB = new Reportmanager(req, res)
    let query = req.body
    reportDB.insert(query)
})

router.get('/report', function(req: express.Request, res: express.Response){
    let reportDB = new Reportmanager(req, res)
    let query = req.query
    reportDB.read(query)
})

router.put('/report', function(req: express.Request, res: express.Response){
    let reportDB = new Reportmanager(req, res)
    let query = req.body
    reportDB.update(query)
})

router.put('/report/process', function(req: express.Request, res: express.Response){
    
})

module.exports = router